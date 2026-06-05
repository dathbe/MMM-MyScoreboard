'use strict'

/*
  CJS variant of start-mm.mjs — Playwright runs in CommonJS.
*/

const { spawn } = require('node:child_process')
const path = require('node:path')

async function startMM(opts) {
  const {
    mmDir,
    fixturePort,
    port = 8080,
    timeoutMs = 30000,
    env = process.env,
  } = opts

  const shim = path.resolve(__dirname, 'fetch-shim.js')
  const shimUrl = `file:///${shim.replaceAll('\\', '/')}`

  const child = spawn(process.platform === 'win32' ? 'npm.cmd' : 'npm',
    ['run', 'server'],
    {
      cwd: mmDir,
      env: {
        ...env,
        FIXTURE_PORT: String(fixturePort),
        NODE_OPTIONS: `${env.NODE_OPTIONS ?? ''} --import "${shimUrl}"`.trim(),
      },
      stdio: ['ignore', 'pipe', 'pipe'],
      shell: process.platform === 'win32',
    })

  let stdoutBuf = ''
  child.stdout.on('data', (d) => {
    stdoutBuf += d.toString()
    if (process.env.MM_VERBOSE) process.stdout.write(d)
  })
  child.stderr.on('data', (d) => {
    if (process.env.MM_VERBOSE) process.stderr.write(d)
  })

  const start = Date.now()
  while (Date.now() - start < timeoutMs) {
    try {
      const r = await fetch(`http://localhost:${port}/`, { signal: AbortSignal.timeout(1500) })
      if (r.status < 500) {
        return {
          child,
          stop: () => new Promise((resolve) => {
            child.once('exit', () => resolve())
            try {
              if (process.platform === 'win32') {
                spawn('taskkill', ['/pid', String(child.pid), '/T', '/F'])
              }
              else {
                child.kill('SIGTERM')
              }
            }
            catch {
              child.kill('SIGTERM')
            }
            // Safety net — force-resolve after 5s if exit never fires.
            setTimeout(() => resolve(), 5000)
          }),
        }
      }
    }
    catch {
      // Server not up — wait and retry.
    }
    await new Promise(r => setTimeout(r, 500))
  }

  child.kill()
  throw new Error(`MagicMirror did not respond within ${timeoutMs}ms.\nstdout tail:\n${stdoutBuf.slice(-2000)}`)
}

module.exports = { startMM }
