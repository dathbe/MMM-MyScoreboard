/*
  Start MagicMirror's server (npm run server) with the fetch-shim
  installed via NODE_OPTIONS. Returns when the server responds 200 on /
  or times out after 30s.
*/

import { spawn } from 'node:child_process'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

export async function startMM(opts) {
  const {
    mmDir,
    fixturePort,
    port = 8080,
    timeoutMs = 30000,
    env = process.env,
  } = opts

  const shim = path.resolve(__dirname, 'fetch-shim.js')
  const child = spawn(process.platform === 'win32' ? 'npm.cmd' : 'npm',
    ['run', 'server'],
    {
      cwd: mmDir,
      env: {
        ...env,
        FIXTURE_PORT: String(fixturePort),
        NODE_OPTIONS: `${env.NODE_OPTIONS ?? ''} --import "file:///${shim.replaceAll('\\', '/')}"`.trim(),
      },
      stdio: ['ignore', 'pipe', 'pipe'],
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
            child.kill()
          }),
        }
      }
    }
    catch {
      // Server not up yet — wait and retry
    }
    await new Promise(r => setTimeout(r, 500))
  }

  child.kill()
  throw new Error(`MagicMirror did not respond within ${timeoutMs}ms.\nstdout tail:\n${stdoutBuf.slice(-2000)}`)
}
