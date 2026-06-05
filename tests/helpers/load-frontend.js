'use strict'

/*
  Load MMM-MyScoreboard.js and capture the descriptor passed to
  Module.register().

  Implementation note: we compile the file source as a Function so it
  runs in the *current* realm — that way Array/Object/etc. produced by
  the module match the test's prototype chain (no cross-realm gotchas
  on assert.deepEqual). Module, Log, moment, document, window, and
  config are passed in as parameters.
*/

const fs = require('node:fs')
const path = require('node:path')
const vm = require('node:vm')
const { parseHTML } = require('linkedom')
const moment = require('moment-timezone')

const SOURCE_PATH = path.resolve(__dirname, '../../MMM-MyScoreboard.js')

function loadFrontend(overrides = {}) {
  const { document, window } = parseHTML('<!DOCTYPE html><html><body></body></html>')

  let capturedDef = null
  const Module = {
    register(name, def) {
      capturedDef = def
    },
  }

  const Log = {
    log: () => {}, info: () => {}, warn: () => {}, error: () => {}, debug: () => {},
  }

  const config = overrides.config ?? { timeFormat: 12 }
  const source = fs.readFileSync(SOURCE_PATH, 'utf8')

  // Compile the source as a function whose parameters supply the globals
  // MMM-MyScoreboard.js expects (Module, Log, moment, document, window, config).
  // This keeps the source in the host realm so its Array/Object literals
  // match host prototypes.
  const fn = vm.compileFunction(
    source,
    ['Module', 'Log', 'moment', 'document', 'window', 'config'],
    { filename: SOURCE_PATH },
  )
  fn(Module, Log, moment, document, window, config)

  if (!capturedDef) {
    throw new Error('loadFrontend: Module.register was not called')
  }
  return { def: capturedDef, Module, Log, document, window, config }
}

function makeInstance(def, init = {}) {
  const instance = Object.create(def)
  Object.assign(instance, {
    config: Object.assign({}, def.defaults, init.config ?? {}),
    identifier: init.identifier ?? 'module-1',
    name: 'MMM-MyScoreboard',
    sportsData: init.sportsData ?? {},
    sportsDataYd: init.sportsDataYd ?? {},
    followedTeams: init.followedTeams ?? {},
    upcomingGames: init.upcomingGames ?? {},
    upcomingRequestedAt: init.upcomingRequestedAt ?? {},
    upcomingRequestedTeams: init.upcomingRequestedTeams ?? {},
    supportedLeagues: init.supportedLeagues ?? {},
    noGamesToday: init.noGamesToday ?? {},
    scoreAnimations: init.scoreAnimations ?? {},
    sentNotifications: [],
    domUpdated: 0,
  })

  instance.sendSocketNotification = function (notification, payload) {
    instance.sentNotifications.push({ notification, payload })
    if (typeof init.onSendSocket === 'function') {
      init.onSendSocket(notification, payload)
    }
  }
  instance.updateDom = function () {
    instance.domUpdated += 1
  }
  return instance
}

module.exports = { loadFrontend, makeInstance }
