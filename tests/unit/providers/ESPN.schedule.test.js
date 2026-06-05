'use strict'

const { describe, it, beforeEach, afterEach } = require('node:test')
const assert = require('node:assert/strict')
const path = require('node:path')

const ESPN = require(path.resolve(__dirname, '../../../providers/ESPN.js'))
const { mockFetch } = require('../../helpers/mock-fetch')

/*
  PR #198 focus: extractNextGame + getTeamSchedule.

  Synthetic ESPN /teams/{abbr}/schedule response shape (minimal):
  {
    events: [{
      id: '...',
      date: ISO8601,
      competitions: [{
        date: ISO8601,
        status: { type: { id, completed } },
        competitors: [
          { homeAway: 'home', team: {...} },
          { homeAway: 'away', team: {...} },
        ],
      }],
    }, ...],
  }
*/

function team(opts) {
  return {
    abbreviation: opts.abbreviation,
    name: opts.name,
    shortDisplayName: opts.shortDisplayName ?? opts.name,
    displayName: opts.displayName ?? opts.name,
    logo: opts.logo,
    logos: opts.logos,
  }
}

function event(opts) {
  return {
    id: opts.id ?? 'e1',
    date: opts.date,
    competitions: [{
      date: opts.date,
      status: {
        type: {
          id: opts.statusId ?? '1',
          completed: opts.completed ?? false,
        },
      },
      competitors: [
        { homeAway: 'home', team: opts.home },
        { homeAway: 'away', team: opts.away },
      ],
    }],
  }
}

const TOR = team({ abbreviation: 'TOR', name: 'Maple Leafs', shortDisplayName: 'Leafs', logo: 'https://espn.com/tor.png' })
const MTL = team({ abbreviation: 'MTL', name: 'Canadiens', shortDisplayName: 'Habs' })
const BOS = team({ abbreviation: 'BOS', name: 'Bruins', shortDisplayName: 'Bruins' })

describe('ESPN.extractNextGame', () => {
  it('returns null for null body', () => {
    assert.equal(ESPN.extractNextGame({ league: 'NHL' }, null), null)
  })

  it('returns null for empty events', () => {
    assert.equal(ESPN.extractNextGame({ league: 'NHL' }, { events: [] }), null)
  })

  it('returns null when body has no events key', () => {
    assert.equal(ESPN.extractNextGame({ league: 'NHL' }, {}), null)
  })

  it('returns null when all events are in the past', () => {
    const body = {
      events: [
        event({ date: '2020-01-01T00:00:00Z', home: TOR, away: MTL }),
        event({ date: '2020-02-01T00:00:00Z', home: BOS, away: TOR }),
      ],
    }
    assert.equal(ESPN.extractNextGame({ league: 'NHL' }, body), null)
  })

  it('returns the earliest future event', () => {
    const futureA = new Date(Date.now() + 24 * 3600 * 1000).toISOString()
    const futureB = new Date(Date.now() + 48 * 3600 * 1000).toISOString()
    const body = {
      events: [
        event({ id: 'B', date: futureB, home: BOS, away: TOR }),
        event({ id: 'A', date: futureA, home: TOR, away: MTL }),
      ],
    }
    const next = ESPN.extractNextGame({ league: 'NHL' }, body)
    assert.equal(next.gameDate, futureA)
    assert.equal(next.hTeam, 'TOR')
    assert.equal(next.vTeam, 'MTL')
  })

  it('filters out completed events', () => {
    const future = new Date(Date.now() + 24 * 3600 * 1000).toISOString()
    const body = {
      events: [
        event({ date: future, home: TOR, away: MTL, completed: true }),
      ],
    }
    assert.equal(ESPN.extractNextGame({ league: 'NHL' }, body), null)
  })

  it('filters out cancelled events (status.type.id === "5")', () => {
    const future = new Date(Date.now() + 24 * 3600 * 1000).toISOString()
    const body = {
      events: [
        event({ date: future, home: TOR, away: MTL, statusId: '5' }),
      ],
    }
    assert.equal(ESPN.extractNextGame({ league: 'NHL' }, body), null)
  })

  it('filters out postponed events (status.type.id === "6")', () => {
    const future = new Date(Date.now() + 24 * 3600 * 1000).toISOString()
    const body = {
      events: [
        event({ date: future, home: TOR, away: MTL, statusId: '6' }),
      ],
    }
    assert.equal(ESPN.extractNextGame({ league: 'NHL' }, body), null)
  })

  it('skips past, picks next future', () => {
    const past = '2020-01-01T00:00:00Z'
    const future = new Date(Date.now() + 48 * 3600 * 1000).toISOString()
    const body = {
      events: [
        event({ date: past, home: TOR, away: MTL, completed: true }),
        event({ date: future, home: BOS, away: TOR }),
      ],
    }
    const next = ESPN.extractNextGame({ league: 'NHL' }, body)
    assert.equal(next.hTeam, 'BOS')
    assert.equal(next.vTeam, 'TOR')
  })

  it('returns object with PR #198 expected shape', () => {
    const future = new Date(Date.now() + 24 * 3600 * 1000).toISOString()
    const body = {
      events: [event({ date: future, home: TOR, away: MTL })],
    }
    const next = ESPN.extractNextGame({ league: 'NHL' }, body)
    assert.deepEqual(next.classes, ['upcoming'])
    assert.equal(next.gameMode, 0)
    assert.equal(next.hScore, 0)
    assert.equal(next.vScore, 0)
    assert.equal(Array.isArray(next.status), true)
    assert.equal(next.status.length, 2)
    assert.equal(next.hTeamLogoUrl, 'https://espn.com/tor.png')
    assert.equal(next.broadcast.length, 0)
    assert.equal(next.baseballSituation, null)
    assert.equal(next.gameDate, future)
  })

  it('NCAA league produces "ABBR Name" long format', () => {
    const future = new Date(Date.now() + 24 * 3600 * 1000).toISOString()
    const OSU = team({ abbreviation: 'OSU', name: 'Buckeyes' })
    const MICH = team({ abbreviation: 'MICH', name: 'Wolverines' })
    const body = { events: [event({ date: future, home: OSU, away: MICH })] }
    const next = ESPN.extractNextGame({ league: 'NCAAF' }, body)
    assert.equal(next.hTeamLong, 'OSU Buckeyes')
    assert.equal(next.vTeamLong, 'MICH Wolverines')
  })

  it('non-NCAA uses shortDisplayName fallback chain', () => {
    const future = new Date(Date.now() + 24 * 3600 * 1000).toISOString()
    const body = { events: [event({ date: future, home: TOR, away: MTL })] }
    const next = ESPN.extractNextGame({ league: 'NHL' }, body)
    assert.equal(next.hTeamLong, 'Leafs')
    assert.equal(next.vTeamLong, 'Habs')
  })

  it('falls back to first 4 chars of name when abbreviation is missing', () => {
    const future = new Date(Date.now() + 24 * 3600 * 1000).toISOString()
    const noAbbr = team({ name: 'Penguins' })
    const body = { events: [event({ date: future, home: TOR, away: noAbbr })] }
    const next = ESPN.extractNextGame({ league: 'NHL' }, body)
    assert.equal(next.vTeam, 'PENG')
  })

  it('returns empty string when team has no logo', () => {
    const future = new Date(Date.now() + 24 * 3600 * 1000).toISOString()
    const noLogo = team({ abbreviation: 'NOL', name: 'NoLogo' })
    const body = { events: [event({ date: future, home: TOR, away: noLogo })] }
    const next = ESPN.extractNextGame({ league: 'NHL' }, body)
    assert.equal(next.vTeamLogoUrl, '')
  })

  it('uses team.logos[0].href when team.logo absent', () => {
    const future = new Date(Date.now() + 24 * 3600 * 1000).toISOString()
    const withLogos = team({
      abbreviation: 'XYZ',
      name: 'Anything',
      logos: [{ href: 'https://espn.com/x.png' }],
    })
    const body = { events: [event({ date: future, home: TOR, away: withLogos })] }
    const next = ESPN.extractNextGame({ league: 'NHL' }, body)
    assert.equal(next.vTeamLogoUrl, 'https://espn.com/x.png')
  })

  it('reorders so home is first when ESPN puts away in competitors[0]', () => {
    const future = new Date(Date.now() + 24 * 3600 * 1000).toISOString()
    // Build event with reversed competitors order.
    const reversed = {
      id: 'r1',
      date: future,
      competitions: [{
        date: future,
        status: { type: { id: '1', completed: false } },
        competitors: [
          { homeAway: 'away', team: MTL },
          { homeAway: 'home', team: TOR },
        ],
      }],
    }
    const next = ESPN.extractNextGame({ league: 'NHL' }, { events: [reversed] })
    assert.equal(next.hTeam, 'TOR')
    assert.equal(next.vTeam, 'MTL')
  })

  it('debugHours shifts "now" forward so near-future games are skipped', () => {
    // Game is 2 hours from real now; debugHours=4 makes it "in the past".
    const future = new Date(Date.now() + 2 * 3600 * 1000).toISOString()
    const body = { events: [event({ date: future, home: TOR, away: MTL })] }
    const next = ESPN.extractNextGame({ league: 'NHL', debugHours: 4 }, body)
    assert.equal(next, null)
  })

  it('config.timeFormat=24 produces H:mm time label', () => {
    const future = '2099-06-15T19:30:00Z'
    const body = { events: [event({ date: future, home: TOR, away: MTL })] }
    const prev = globalThis.config.timeFormat
    globalThis.config.timeFormat = 24
    try {
      const next = ESPN.extractNextGame({ league: 'NHL' }, body)
      // Status[1] is the time label; in 24h mode it must not contain "am"/"pm".
      assert.equal(/am|pm/i.test(next.status[1]), false)
    }
    finally {
      globalThis.config.timeFormat = prev
    }
  })

  it('config.timeFormat=12 produces "h:mm a" time label', () => {
    const future = '2099-06-15T19:30:00Z'
    const body = { events: [event({ date: future, home: TOR, away: MTL })] }
    globalThis.config.timeFormat = 12
    const next = ESPN.extractNextGame({ league: 'NHL' }, body)
    assert.match(next.status[1], /am|pm/i)
  })
})

describe('ESPN.getTeamSchedule', () => {
  let mock

  beforeEach(() => {
    // Reset cache between tests.
    ESPN.teamScheduleCache = {}
    mock = mockFetch()
  })

  afterEach(() => {
    mock.restore()
  })

  function futureEvent(date, home, away) {
    return event({ date, home, away })
  }

  it('returns {} immediately for unsupported league', async () => {
    let cbResult = null
    await ESPN.getTeamSchedule({ league: 'NOT_A_LEAGUE', teams: ['TOR'] }, (r) => {
      cbResult = r
    })
    assert.deepEqual(cbResult, {})
  })

  it('returns {} for scorepanel league (RUGBY)', async () => {
    let cbResult = null
    await ESPN.getTeamSchedule({ league: 'RUGBY', teams: ['ABC'] }, (r) => {
      cbResult = r
    })
    assert.deepEqual(cbResult, {})
  })

  it('returns {} for empty teams array', async () => {
    let cbResult = null
    await ESPN.getTeamSchedule({ league: 'NHL', teams: [] }, (r) => {
      cbResult = r
    })
    assert.deepEqual(cbResult, {})
  })

  it('happy path: fetches, parses, populates cache', async () => {
    const future = new Date(Date.now() + 24 * 3600 * 1000).toISOString()
    const url = 'https://site.api.espn.com/apis/site/v2/sports/hockey/nhl/teams/TOR/schedule'
    mock.route(url, { events: [futureEvent(future, TOR, MTL)] })

    let cbResult = null
    await ESPN.getTeamSchedule({ league: 'NHL', teams: ['TOR'] }, (r) => {
      cbResult = r
    })

    assert.equal(mock.hits(url), 1)
    assert.equal(cbResult.TOR.hTeam, 'TOR')
    assert.equal(ESPN.teamScheduleCache['NHL:TOR'].nextGame.hTeam, 'TOR')
  })

  it('second call within TTL hits cache (no second fetch)', async () => {
    const future = new Date(Date.now() + 24 * 3600 * 1000).toISOString()
    const url = 'https://site.api.espn.com/apis/site/v2/sports/hockey/nhl/teams/TOR/schedule'
    mock.route(url, { events: [futureEvent(future, TOR, MTL)] })

    await ESPN.getTeamSchedule({ league: 'NHL', teams: ['TOR'] }, () => {})
    await ESPN.getTeamSchedule({ league: 'NHL', teams: ['TOR'] }, () => {})

    assert.equal(mock.hits(url), 1)
  })

  it('expired cache (>6h) triggers refetch', async () => {
    const future = new Date(Date.now() + 24 * 3600 * 1000).toISOString()
    const url = 'https://site.api.espn.com/apis/site/v2/sports/hockey/nhl/teams/TOR/schedule'
    mock.route(url, { events: [futureEvent(future, TOR, MTL)] })

    await ESPN.getTeamSchedule({ league: 'NHL', teams: ['TOR'] }, () => {})
    // Backdate the cache entry by 7 hours.
    ESPN.teamScheduleCache['NHL:TOR'].fetchedAt = Date.now() - 7 * 3600 * 1000
    await ESPN.getTeamSchedule({ league: 'NHL', teams: ['TOR'] }, () => {})

    assert.equal(mock.hits(url), 2)
  })

  it('HTTP 404 caches null and returns null for that team', async () => {
    const url = 'https://site.api.espn.com/apis/site/v2/sports/hockey/nhl/teams/TOR/schedule'
    mock.route(url, '', { status: 404 })

    let cbResult = null
    await ESPN.getTeamSchedule({ league: 'NHL', teams: ['TOR'] }, (r) => {
      cbResult = r
    })

    assert.equal(cbResult.TOR, null)
    assert.equal(ESPN.teamScheduleCache['NHL:TOR'].nextGame, null)
  })

  it('multi-team call hits each team URL', async () => {
    const future = new Date(Date.now() + 24 * 3600 * 1000).toISOString()
    const urlTor = 'https://site.api.espn.com/apis/site/v2/sports/hockey/nhl/teams/TOR/schedule'
    const urlBos = 'https://site.api.espn.com/apis/site/v2/sports/hockey/nhl/teams/BOS/schedule'
    mock.route(urlTor, { events: [futureEvent(future, TOR, MTL)] })
    mock.route(urlBos, { events: [futureEvent(future, BOS, MTL)] })

    let cbResult = null
    await ESPN.getTeamSchedule({ league: 'NHL', teams: ['TOR', 'BOS'] }, (r) => {
      cbResult = r
    })

    assert.equal(mock.hits(urlTor), 1)
    assert.equal(mock.hits(urlBos), 1)
    assert.equal(cbResult.TOR.hTeam, 'TOR')
    assert.equal(cbResult.BOS.hTeam, 'BOS')
  })
})
