'use strict'

const { describe, it } = require('node:test')
const assert = require('node:assert/strict')
const path = require('node:path')

const ESPN = require(path.resolve(__dirname, '../../../providers/ESPN.js'))

describe('ESPN.getLeaguePath', () => {
  it('maps known leagues', () => {
    assert.equal(ESPN.getLeaguePath('NFL'), 'football/nfl')
    assert.equal(ESPN.getLeaguePath('NHL'), 'hockey/nhl')
    assert.equal(ESPN.getLeaguePath('NBA'), 'basketball/nba')
    assert.equal(ESPN.getLeaguePath('MLB'), 'baseball/mlb')
    assert.equal(ESPN.getLeaguePath('NCAAF'), 'football/college-football')
    assert.equal(ESPN.getLeaguePath('MLS'), 'soccer/usa.1')
  })

  it('NCAAM_MM uses same path as NCAAM', () => {
    assert.equal(ESPN.getLeaguePath('NCAAM_MM'), ESPN.getLeaguePath('NCAAM'))
  })

  it('returns undefined for unknown league', () => {
    assert.equal(ESPN.getLeaguePath('NOT_A_LEAGUE'), undefined)
  })
})

describe('ESPN.isSoccer', () => {
  it('returns true for soccer league keys', () => {
    assert.equal(ESPN.isSoccer('USA_MLS'), true)
    assert.equal(ESPN.isSoccer('GER_BUNDESLIGA'), true)
    assert.equal(ESPN.isSoccer('English Premier League'), true)
  })

  it('returns false for non-soccer leagues', () => {
    assert.equal(ESPN.isSoccer('NHL'), false)
    assert.equal(ESPN.isSoccer('NFL'), false)
    assert.equal(ESPN.isSoccer('MLB'), false)
  })

  it('returns false for top-level MLS key (uses USA_MLS in SOCCER_LEAGUES instead)', () => {
    // Documents an existing quirk: the league config uses 'MLS' but the
    // soccer-detection list uses 'USA_MLS'. Soccer-specific status formatting
    // (extra time labels) does not kick in for MLS games — the league code
    // path treats them like non-soccer.
    assert.equal(ESPN.isSoccer('MLS'), false)
  })
})

describe('ESPN.getOrdinal', () => {
  const cases = [
    [1, '1<sup>ST</sup>'],
    [2, '2<sup>ND</sup>'],
    [3, '3<sup>RD</sup>'],
    [4, '4<sup>TH</sup>'],
    [11, '11<sup>TH</sup>'],
    [12, '12<sup>TH</sup>'],
    [13, '13<sup>TH</sup>'],
    [21, '21<sup>ST</sup>'],
    [22, '22<sup>ND</sup>'],
    [23, '23<sup>RD</sup>'],
    [101, '101<sup>ST</sup>'],
    [111, '111<sup>TH</sup>'],
    [112, '112<sup>TH</sup>'],
  ]

  for (const [n, expected] of cases) {
    it(`${n} → ${expected}`, () => {
      assert.equal(ESPN.getOrdinal(n), expected)
    })
  }
})

describe('ESPN.getPeriod', () => {
  it('NHL period 1 → 1ST', () => {
    assert.equal(ESPN.getPeriod('NHL', 1), '1<sup>ST</sup>')
  })

  it('NHL period 5 → OT', () => {
    assert.equal(ESPN.getPeriod('NHL', 5), 'OT')
  })

  it('NHL period 6 → 2OT', () => {
    assert.equal(ESPN.getPeriod('NHL', 6), '2OT')
  })

  it('soccer half 1 → empty', () => {
    assert.equal(ESPN.getPeriod('USA_MLS', 1), '')
  })

  it('soccer extra time → ET', () => {
    assert.equal(ESPN.getPeriod('USA_MLS', 3), 'ET')
  })
})

describe('ESPN.getFinalOT', () => {
  it('NHL period 4 → empty', () => {
    assert.equal(ESPN.getFinalOT('NHL', 4), '')
  })

  it('NHL period 5 → " (OT)"', () => {
    assert.equal(ESPN.getFinalOT('NHL', 5), ' (OT)')
  })

  it('NHL period 7 → " (3OT)"', () => {
    assert.equal(ESPN.getFinalOT('NHL', 7), ' (3OT)')
  })

  it('MLB period 9 → empty (regulation)', () => {
    assert.equal(ESPN.getFinalOT('MLB', 9), '')
  })

  it('MLB period 11 → " (11)"', () => {
    assert.equal(ESPN.getFinalOT('MLB', 11), ' (11)')
  })

  it('soccer extra time → " (ET)"', () => {
    assert.equal(ESPN.getFinalOT('USA_MLS', 3), ' (ET)')
  })
})

describe('ESPN.getFinalPK', () => {
  it('returns shootout score in HxV form', () => {
    const h = { shootoutScore: 4 }
    const v = { shootoutScore: 3 }
    assert.equal(ESPN.getFinalPK(h, v), '4x3')
  })
})

describe('ESPN module shape', () => {
  it('exposes PROVIDER_NAME = "ESPN"', () => {
    assert.equal(ESPN.PROVIDER_NAME, 'ESPN')
  })

  it('exposes getScores, getTeamSchedule, formatScores, extractNextGame', () => {
    assert.equal(typeof ESPN.getScores, 'function')
    assert.equal(typeof ESPN.getTeamSchedule, 'function')
    assert.equal(typeof ESPN.formatScores, 'function')
    assert.equal(typeof ESPN.extractNextGame, 'function')
  })

  it('has at least one league mapped for each major sport', () => {
    for (const lg of ['NFL', 'NBA', 'NHL', 'MLB', 'MLS', 'NCAAF']) {
      assert.ok(ESPN.LEAGUE_PATHS[lg], `${lg} should be in LEAGUE_PATHS`)
    }
  })
})
