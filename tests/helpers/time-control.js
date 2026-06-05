'use strict'

/*
  Deterministic time control for unit tests.

  setFakeNow('2025-10-15T20:00:00Z'):
    - freezes Date.now() and `new Date()` (no-arg) to that instant
    - freezes moment.now (if moment-timezone is loadable)
    - freezes Temporal.Now.* methods (if the temporal-polyfill global is loaded)

  restore() unwinds all three.
*/

let active = null

function setFakeNow(iso) {
  if (active) restore()

  const fixed = new Date(iso)
  const fixedMs = fixed.getTime()

  // Date
  const OrigDate = Date
  const NowFn = function () {
    return fixedMs
  }
  class FakeDate extends OrigDate {
    constructor(...args) {
      if (args.length === 0) {
        super(fixedMs)
      }
      else {
        super(...args)
      }
    }

    static now() { return fixedMs }
  }
  // Some libs use Date.now directly via the original constructor reference.
  OrigDate.now = NowFn
  global.Date = FakeDate

  // moment
  let momentRestore = null
  try {
    const moment = require('moment-timezone')
    const origMomentNow = moment.now
    moment.now = NowFn
    momentRestore = () => {
      moment.now = origMomentNow
    }
  }
  catch {
    /* moment not available — fine */
  }

  // Temporal — replace Now functions if Temporal is present globally.
  let temporalRestore = null
  if (typeof globalThis.Temporal !== 'undefined') {
    const origNow = globalThis.Temporal.Now
    const fakeNow = Object.create(origNow)
    fakeNow.instant = () => globalThis.Temporal.Instant.fromEpochMilliseconds(fixedMs)
    fakeNow.zonedDateTimeISO = tz => globalThis.Temporal.Instant.fromEpochMilliseconds(fixedMs)
      .toZonedDateTimeISO(tz ?? Intl.DateTimeFormat().resolvedOptions().timeZone)
    fakeNow.plainDateISO = tz => globalThis.Temporal.Instant.fromEpochMilliseconds(fixedMs)
      .toZonedDateTimeISO(tz ?? Intl.DateTimeFormat().resolvedOptions().timeZone)
      .toPlainDate()
    fakeNow.plainDateTimeISO = tz => globalThis.Temporal.Instant.fromEpochMilliseconds(fixedMs)
      .toZonedDateTimeISO(tz ?? Intl.DateTimeFormat().resolvedOptions().timeZone)
      .toPlainDateTime()
    fakeNow.timeZoneId = () => Intl.DateTimeFormat().resolvedOptions().timeZone
    globalThis.Temporal.Now = fakeNow
    temporalRestore = () => {
      globalThis.Temporal.Now = origNow
    }
  }

  active = {
    restore() {
      global.Date = OrigDate
      delete OrigDate.now
      OrigDate.now = function () {
        return new OrigDate().getTime()
      }
      if (momentRestore) momentRestore()
      if (temporalRestore) temporalRestore()
      active = null
    },
  }
}

function restore() {
  if (active) active.restore()
}

module.exports = { setFakeNow, restore }
