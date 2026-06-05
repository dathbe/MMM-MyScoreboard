/*
  Shared Temporal-based time helpers.

  This module is used by node_helper.js and all server-side providers.
  It installs the Temporal API globally via the temporal-polyfill package
  so the rest of the server code can use `Temporal.*` directly.

  All functions return Temporal objects (ZonedDateTime, PlainDate, Instant)
  or plain strings — no wrapper objects. This keeps the surface small and
  lets callers use Temporal's own API directly when they need more than
  the common patterns captured here.
*/

require('temporal-polyfill/global')

module.exports = {

  // Current time in the system timezone, optionally shifted by the debug
  // offsets the module exposes via config.
  nowZoned: function (debugHours, debugMinutes) {
    var zdt = Temporal.Now.zonedDateTimeISO()
    var offset = {}
    if (debugHours) offset.hours = debugHours
    if (debugMinutes) offset.minutes = debugMinutes
    if (offset.hours || offset.minutes) {
      zdt = zdt.add(offset)
    }
    return zdt
  },

  // Best-guess system timezone.
  localTZ: function () {
    return Intl.DateTimeFormat().resolvedOptions().timeZone
  },

  // Format a ZonedDateTime or PlainDate as 'YYYY-MM-DD'.
  formatISODate: function (x) {
    var pd = (x instanceof Temporal.PlainDate) ? x : x.toPlainDate()
    return pd.toString()
  },

  // Format a ZonedDateTime or PlainDate as 'YYYYMMDD'.
  formatCompactDate: function (x) {
    return this.formatISODate(x).replaceAll('-', '')
  },

  // Format a ZonedDateTime as clock time — 'h:mm a' (12h, lowercase am/pm)
  // or 'H:mm' (24h), matching the moment.js tokens previously used.
  formatClockTime: function (zdt, is24h) {
    var minute = String(zdt.minute).padStart(2, '0')
    if (is24h) {
      return zdt.hour + ':' + minute
    }
    var h12 = zdt.hour % 12
    if (h12 === 0) h12 = 12
    var ampm = zdt.hour < 12 ? 'am' : 'pm'
    return h12 + ':' + minute + ' ' + ampm
  },

  // Parse an ISO-8601 instant string (with offset or Z) into a ZonedDateTime.
  zonedFromISO: function (isoString, timeZone) {
    return Temporal.Instant.from(isoString).toZonedDateTimeISO(timeZone)
  },

  // Parse an epoch millisecond value into a ZonedDateTime in the given zone.
  zonedFromEpochMs: function (ms, timeZone) {
    return Temporal.Instant.fromEpochMilliseconds(ms).toZonedDateTimeISO(timeZone)
  },

  // Parse a compact 'YYYYMMDD' string into a PlainDate.
  plainDateFromCompact: function (str) {
    var s = String(str)
    return Temporal.PlainDate.from(s.slice(0, 4) + '-' + s.slice(4, 6) + '-' + s.slice(6, 8))
  },
}
