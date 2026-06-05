'use strict'

// Stub for MagicMirror's `logger` module. Tests can override by setting
// process.env.TEST_VERBOSE_LOGS=1 to inspect log calls.
const verbose = !!process.env.TEST_VERBOSE_LOGS

function noop() {}
function pass(...args) {
  console.log(...args)
}
const fn = verbose ? pass : noop

module.exports = {
  log: fn,
  info: fn,
  warn: fn,
  error: fn,
  debug: fn,
}
