'use strict'

/*
  Regression test for issue #210 — "World Cup Game missing".

  ESPN buckets games by US Eastern calendar date, but formatScores() filters
  the returned events by the *viewer's local* calendar date. A match kicking
  off at 02:00 UTC is filed by ESPN under the previous (Eastern) day, yet for a
  European viewer it falls on the current local day. Before the fix it was
  returned by neither the "today" nor the "yesterday" query and disappeared.

  These tests pin the local timezone (moment.tz.guess) so the behaviour is
  deterministic regardless of the machine running them.
*/

const { describe, it, beforeEach, afterEach } = require('node:test')
const assert = require('node:assert/strict')
const path = require('node:path')

const moment = require('moment-timezone')
const ESPN = require(path.resolve(__dirname, '../../../providers/ESPN.js'))
const { mockFetch } = require('../../helpers/mock-fetch')

const SB = 'https://site.web.api.espn.com/apis/site/v2/sports/soccer/fifa.world/scoreboard?dates='

// Minimal soccer competitor / event shapes that formatScores() reads.
function competitor(abbr, homeAway, score) {
  return {
    homeAway: homeAway,
    score: score,
    team: {
      abbreviation: abbr,
      name: abbr,
      shortDisplayName: abbr,
      displayName: abbr,
      logo: '',
    },
  }
}

function soccerFinal(id, isoDate, home, away, hScore, vScore) {
  return {
    id: id,
    date: isoDate,
    competitions: [{
      date: isoDate,
      broadcasts: [],
      competitors: [
        competitor(home, 'home', hScore),
        competitor(away, 'away', vScore),
      ],
    }],
    status: { type: { id: '28', shortDetail: 'FT', detail: 'Full Time', description: 'Full Time' } },
  }
}

const payload = {
  league: 'FIFA_WORLD_CUP',
  index: 0,
  teams: null, // all games
  hideBroadcasts: true,
  skipChannels: [],
  localMarkets: [],
  displayLocalChannels: [],
  showLocalBroadcasts: false,
  debugHours: 0,
  debugMinutes: 0,
}

describe('ESPN.getScores timezone widening (issue #210)', () => {
  let mock
  let origGuess

  beforeEach(() => {
    mock = mockFetch()
    origGuess = moment.tz.guess
    // Pretend the viewer is in central Europe (UTC+2 in June, east of ET).
    moment.tz.guess = () => 'Europe/Berlin'
  })

  afterEach(() => {
    mock.restore()
    moment.tz.guess = origGuess
  })

  it('keeps a 02:00Z match that ESPN files under the previous Eastern day', async () => {
    // "Today" for the European viewer is 2026-06-12.
    // ESPN files the Korea match (02:00Z = 22:00 ET on the 11th) under June 11.
    mock.route(SB + '20260612&limit=200', {
      events: [soccerFinal('today', '2026-06-12T19:00Z', 'CAN', 'BIH', 1, 0)],
    })
    mock.route(SB + '20260611&limit=200', {
      events: [
        soccerFinal('mexopen', '2026-06-11T19:00Z', 'MEX', 'RSA', 2, 1),
        soccerFinal('korea', '2026-06-12T02:00Z', 'KOR', 'CZE', 3, 1),
      ],
    })

    let scores = null
    await ESPN.getScores(payload, moment('20260612', 'YYYYMMDD'), (s) => {
      scores = s
    })

    const matchups = scores.map(g => `${g.vTeam}@${g.hTeam}`)
    // The Korea match (local June 12) is recovered from the neighbor day...
    assert.ok(matchups.includes('CZE@KOR'), `expected CZE@KOR, got ${JSON.stringify(matchups)}`)
    // ...alongside the genuinely-June-12 match...
    assert.ok(matchups.includes('BIH@CAN'))
    // ...but the June 11 evening match stays out of "today".
    assert.ok(!matchups.includes('RSA@MEX'))
  })

  it('does not duplicate the boundary match into the previous day', async () => {
    // "Yesterday" query for the same viewer is 2026-06-11.
    mock.route(SB + '20260611&limit=200', {
      events: [
        soccerFinal('mexopen', '2026-06-11T19:00Z', 'MEX', 'RSA', 2, 1),
        soccerFinal('korea', '2026-06-12T02:00Z', 'KOR', 'CZE', 3, 1),
      ],
    })
    mock.route(SB + '20260610&limit=200', { events: [] })

    let scores = null
    await ESPN.getScores(payload, moment('20260611', 'YYYYMMDD'), (s) => {
      scores = s
    })

    const matchups = scores.map(g => `${g.vTeam}@${g.hTeam}`)
    // June 11 local day keeps only the evening opener...
    assert.ok(matchups.includes('RSA@MEX'))
    // ...and the 02:00Z match belongs to June 12, not here (no double-show).
    assert.ok(!matchups.includes('CZE@KOR'), `Korea match should not appear on June 11, got ${JSON.stringify(matchups)}`)
  })
})

describe('ESPN.neighborGameDate', () => {
  let origGuess

  afterEach(() => {
    if (origGuess) moment.tz.guess = origGuess
  })

  it('east of Eastern (Europe) pulls the previous day', () => {
    origGuess = moment.tz.guess
    moment.tz.guess = () => 'Europe/Berlin'
    assert.equal(ESPN.neighborGameDate('20260612'), '20260611')
  })

  it('west of Eastern (Pacific) pulls the next day', () => {
    origGuess = moment.tz.guess
    moment.tz.guess = () => 'America/Los_Angeles'
    assert.equal(ESPN.neighborGameDate('20260612'), '20260613')
  })

  it('on Eastern time pulls no neighbor', () => {
    origGuess = moment.tz.guess
    moment.tz.guess = () => 'America/New_York'
    assert.equal(ESPN.neighborGameDate('20260612'), null)
  })
})
