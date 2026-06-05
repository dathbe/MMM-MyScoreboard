/*
  Test runner setup — loaded via `node --test --import ./tests/setup.js`.

  Providers in this module use `require('logger')` and `require('node_helper')`,
  both of which are normally supplied by the MagicMirror runtime. In a bare
  Node test process those modules don't exist, so we inject stubs into the
  require cache before any provider is required.

  We also widen the global fetch via undici's MockAgent so individual tests
  can route specific URLs to fixture JSON without each test having to wire
  the dispatcher itself. See tests/helpers/mock-fetch.js.
*/

'use strict'

const Module = require('node:module')
const path = require('node:path')

const STUB_ROOT = path.join(__dirname, '_stubs')

// MagicMirror exposes a global `config` object at runtime. Providers and the
// frontend module both reference it directly (e.g. ESPN.js extractNextGame
// reads `config.timeFormat`). Provide a default so tests don't ReferenceError;
// individual tests can mutate `globalThis.config.*` as needed.
if (typeof globalThis.config === 'undefined') {
  globalThis.config = { timeFormat: 12 }
}

// Resolve `logger` / `node_helper` to our stubs regardless of where in the
// require tree they're asked for. Patching Module._resolveFilename is the
// cleanest way to support bare-specifier requires from arbitrary depths.
const origResolve = Module._resolveFilename
Module._resolveFilename = function (request, parent, ...rest) {
  if (request === 'logger') return path.join(STUB_ROOT, 'logger.js')
  if (request === 'node_helper') return path.join(STUB_ROOT, 'node_helper.js')
  return origResolve.call(this, request, parent, ...rest)
}
