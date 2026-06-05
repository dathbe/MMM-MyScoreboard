'use strict'

/*
  Tiny HTTP fixture server. Provider requests are URL-rewritten here by
  fetch-shim.js. A route table maps "<METHOD> <pathname><search>" to a
  fixture file. Unmatched requests return 404 so empty-state scenarios
  exercise the no-data code path.

  Usage:
    const { startFixtureServer } = require('./http-server')
    const srv = await startFixtureServer(0)        // any free port
    srv.setRoutes({
      'GET /apis/site/v2/sports/hockey/nhl/teams/TOR/schedule':
        'tests/fixtures/espn/schedule/nhl-team-TOR.json',
    })
    // ...
    srv.close()
*/

const http = require('node:http')
const fs = require('node:fs')
const path = require('node:path')

function startFixtureServer(preferredPort = 0) {
  const state = { routes: new Map(), hits: [] }

  function setRoutes(map) {
    state.routes = new Map(Object.entries(map))
  }

  const server = http.createServer((req, res) => {
    const key = `${req.method} ${req.url}`
    state.hits.push(key)
    const fixture = state.routes.get(key)
    if (fixture === undefined) {
      res.writeHead(404, { 'content-type': 'application/json' })
      res.end(JSON.stringify({ error: 'no fixture', method: req.method, url: req.url }))
      return
    }
    // String path → read file. Plain object → JSON-stringify. Otherwise →
    // assume already-stringified body.
    if (typeof fixture === 'string'
      && (fixture.endsWith('.json') || fixture.endsWith('.txt'))) {
      const abs = path.isAbsolute(fixture) ? fixture : path.resolve(process.cwd(), fixture)
      fs.readFile(abs, (err, buf) => {
        if (err) {
          res.writeHead(500, { 'content-type': 'application/json' })
          res.end(JSON.stringify({ error: String(err) }))
          return
        }
        const ctype = abs.endsWith('.txt') ? 'text/javascript' : 'application/json'
        res.writeHead(200, { 'content-type': ctype })
        res.end(buf)
      })
      return
    }
    const body = (typeof fixture === 'string') ? fixture : JSON.stringify(fixture)
    res.writeHead(200, { 'content-type': 'application/json' })
    res.end(body)
  })

  return new Promise((resolve, reject) => {
    server.on('error', reject)
    server.listen(preferredPort, '127.0.0.1', () => {
      const port = server.address().port
      resolve({
        port,
        setRoutes,
        hits: state.hits,
        close: () => new Promise(r => server.close(r)),
      })
    })
  })
}

module.exports = { startFixtureServer }
