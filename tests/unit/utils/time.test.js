'use strict'

const { describe, it } = require('node:test')
const assert = require('node:assert/strict')
const path = require('node:path')

const time = require(path.resolve(__dirname, '../../../utils/time.js'))

describe('utils/time.js', () => {
  describe('nowZoned', () => {
    it('returns a Temporal.ZonedDateTime', () => {
      const z = time.nowZoned()
      assert.ok(z instanceof Temporal.ZonedDateTime)
    })

    it('with no offsets returns within 5ms of Temporal.Now', () => {
      const before = Temporal.Now.zonedDateTimeISO().epochMilliseconds
      const z = time.nowZoned()
      const after = Temporal.Now.zonedDateTimeISO().epochMilliseconds
      assert.ok(z.epochMilliseconds >= before)
      assert.ok(z.epochMilliseconds <= after + 5)
    })

    it('shifts forward by debugHours', () => {
      const base = time.nowZoned()
      const shifted = time.nowZoned(3, 0)
      const diff = shifted.epochMilliseconds - base.epochMilliseconds
      // Allow 50ms slop for the two distinct Now calls.
      assert.ok(Math.abs(diff - 3 * 3600 * 1000) < 50)
    })

    it('shifts backward by negative debugMinutes', () => {
      const base = time.nowZoned()
      const shifted = time.nowZoned(0, -90)
      const diff = shifted.epochMilliseconds - base.epochMilliseconds
      assert.ok(Math.abs(diff - (-90 * 60 * 1000)) < 50)
    })

    it('with both offsets applies both', () => {
      const base = time.nowZoned()
      const shifted = time.nowZoned(2, 30)
      const expectedMs = (2 * 3600 + 30 * 60) * 1000
      const diff = shifted.epochMilliseconds - base.epochMilliseconds
      assert.ok(Math.abs(diff - expectedMs) < 50)
    })

    it('with both offsets zero does not call add', () => {
      // Smoke test — ensures the falsy-guard works (no exception thrown).
      const z = time.nowZoned(0, 0)
      assert.ok(z instanceof Temporal.ZonedDateTime)
    })
  })

  describe('localTZ', () => {
    it('returns a valid IANA-ish timezone string', () => {
      const tz = time.localTZ()
      assert.equal(typeof tz, 'string')
      assert.match(tz, /^[A-Za-z_]+(\/[A-Za-z_+-]+)*$/)
    })
  })

  describe('formatISODate', () => {
    it('formats a PlainDate', () => {
      const pd = Temporal.PlainDate.from('2024-02-29')
      assert.equal(time.formatISODate(pd), '2024-02-29')
    })

    it('formats a ZonedDateTime as its local date', () => {
      // 2024-11-03T01:30 in New York (during DST fall-back ambiguity).
      const zdt = Temporal.ZonedDateTime.from('2024-11-03T01:30:00-05:00[America/New_York]')
      assert.equal(time.formatISODate(zdt), '2024-11-03')
    })

    it('uses local date, not UTC date', () => {
      // 2025-01-01T03:00Z is still 2024-12-31 in NY.
      const zdt = Temporal.Instant.from('2025-01-01T03:00:00Z')
        .toZonedDateTimeISO('America/New_York')
      assert.equal(time.formatISODate(zdt), '2024-12-31')
    })
  })

  describe('formatCompactDate', () => {
    it('strips dashes from ISO date', () => {
      const pd = Temporal.PlainDate.from('2024-02-29')
      assert.equal(time.formatCompactDate(pd), '20240229')
    })

    it('strips dashes for ZonedDateTime', () => {
      const zdt = Temporal.ZonedDateTime.from('2025-10-15T12:00:00-04:00[America/New_York]')
      assert.equal(time.formatCompactDate(zdt), '20251015')
    })
  })

  describe('formatClockTime', () => {
    const tz = '[America/New_York]'

    it('00:05 12h → "12:05 am"', () => {
      const z = Temporal.ZonedDateTime.from(`2025-01-01T00:05:00-05:00${tz}`)
      assert.equal(time.formatClockTime(z, false), '12:05 am')
    })

    it('00:05 24h → "0:05"', () => {
      const z = Temporal.ZonedDateTime.from(`2025-01-01T00:05:00-05:00${tz}`)
      assert.equal(time.formatClockTime(z, true), '0:05')
    })

    it('12:00 12h → "12:00 pm"', () => {
      const z = Temporal.ZonedDateTime.from(`2025-01-01T12:00:00-05:00${tz}`)
      assert.equal(time.formatClockTime(z, false), '12:00 pm')
    })

    it('13:09 12h → "1:09 pm"', () => {
      const z = Temporal.ZonedDateTime.from(`2025-01-01T13:09:00-05:00${tz}`)
      assert.equal(time.formatClockTime(z, false), '1:09 pm')
    })

    it('13:09 24h → "13:09"', () => {
      const z = Temporal.ZonedDateTime.from(`2025-01-01T13:09:00-05:00${tz}`)
      assert.equal(time.formatClockTime(z, true), '13:09')
    })

    it('23:59 12h → "11:59 pm"', () => {
      const z = Temporal.ZonedDateTime.from(`2025-01-01T23:59:00-05:00${tz}`)
      assert.equal(time.formatClockTime(z, false), '11:59 pm')
    })

    it('pads single-digit minute', () => {
      const z = Temporal.ZonedDateTime.from(`2025-01-01T09:05:00-05:00${tz}`)
      assert.equal(time.formatClockTime(z, false), '9:05 am')
    })
  })

  describe('zonedFromISO', () => {
    it('parses Z-suffixed instant into target zone', () => {
      const z = time.zonedFromISO('2025-10-15T19:30:00Z', 'America/New_York')
      assert.equal(z.hour, 15)
      assert.equal(z.minute, 30)
      assert.equal(z.timeZoneId, 'America/New_York')
    })

    it('parses offset-suffixed instant into a different zone', () => {
      const z = time.zonedFromISO('2025-10-15T19:30:00-04:00', 'America/Los_Angeles')
      // 19:30 EDT → 16:30 PDT
      assert.equal(z.hour, 16)
      assert.equal(z.minute, 30)
    })
  })

  describe('zonedFromEpochMs', () => {
    it('epoch 0 in UTC → 1970-01-01T00:00:00', () => {
      const z = time.zonedFromEpochMs(0, 'UTC')
      assert.equal(z.year, 1970)
      assert.equal(z.month, 1)
      assert.equal(z.day, 1)
      assert.equal(z.hour, 0)
    })
  })

  describe('plainDateFromCompact', () => {
    it('parses YYYYMMDD into a PlainDate', () => {
      const pd = time.plainDateFromCompact('20251015')
      assert.equal(pd.year, 2025)
      assert.equal(pd.month, 10)
      assert.equal(pd.day, 15)
    })

    it('handles leap day', () => {
      const pd = time.plainDateFromCompact('20240229')
      assert.equal(pd.toString(), '2024-02-29')
    })

    it('throws on invalid input', () => {
      assert.throws(() => time.plainDateFromCompact('invalid'))
    })

    it('accepts numeric input via coercion', () => {
      const pd = time.plainDateFromCompact(20251015)
      assert.equal(pd.toString(), '2025-10-15')
    })
  })
})
