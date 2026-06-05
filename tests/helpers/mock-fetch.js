'use strict'

/*
  Fetch mocker — replaces globalThis.fetch with a simple URL→fixture router.

  Usage:
    const { mockFetch } = require('../../helpers/mock-fetch')
    const m = mockFetch()
    m.route('https://site.api.espn.com/.../schedule', { events: [...] })
    m.route('https://other.example.com/foo', 'tests/fixtures/foo.json')
    m.route('https://example.com/missing', '', { status: 404 })
    // run code that calls fetch() ...
    assert.equal(m.hits('https://site.api.espn.com/.../schedule'), 1)
    m.restore()

  Routes match by exact URL string. Unknown URLs throw, so tests fail loud
  if production code calls a URL the test forgot to mock.
*/

const fs = require('node:fs')
const path = require('node:path')

function mockFetch() {
  const routes = new Map()
  const hitCounts = new Map()
  const origFetch = globalThis.fetch

  function resolveBody(body) {
    if (typeof body === 'string'
      && (body.endsWith('.json') || body.endsWith('.txt'))) {
      const fp = path.isAbsolute(body) ? body : path.resolve(body)
      return fs.readFileSync(fp, 'utf8')
    }
    if (typeof body === 'string') return body
    return JSON.stringify(body)
  }

  function route(url, body, opts = {}) {
    routes.set(url, {
      status: opts.status ?? 200,
      headers: opts.headers ?? { 'content-type': 'application/json' },
      body: resolveBody(body),
    })
    hitCounts.set(url, 0)
  }

  globalThis.fetch = async function (input) {
    const url = typeof input === 'string'
      ? input
      : input?.url ? input.url : String(input)
    const r = routes.get(url)
    if (!r) {
      throw new Error(`mockFetch: no route for ${url}`)
    }
    hitCounts.set(url, hitCounts.get(url) + 1)
    return new Response(r.body, { status: r.status, headers: r.headers })
  }

  function hits(url) {
    return hitCounts.get(url) ?? 0
  }

  function setError(url, err) {
    routes.set(url, { error: err })
    hitCounts.set(url, 0)
  }

  // Patch fetch to honor setError routes.
  const wrapped = globalThis.fetch
  globalThis.fetch = async function (input) {
    const url = typeof input === 'string'
      ? input
      : input?.url ? input.url : String(input)
    const r = routes.get(url)
    if (r && r.error) {
      hitCounts.set(url, hitCounts.get(url) + 1)
      throw r.error
    }
    return wrapped(input)
  }

  function restore() {
    globalThis.fetch = origFetch
  }

  return { route, setError, hits, restore }
}

module.exports = { mockFetch }
