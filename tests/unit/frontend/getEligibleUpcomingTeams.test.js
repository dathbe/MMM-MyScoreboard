'use strict'

const { describe, it, before } = require('node:test')
const assert = require('node:assert/strict')

const { loadFrontend, makeInstance } = require('../../helpers/load-frontend')

let def
before(() => {
  def = loadFrontend().def
})

// gameMode constants (mirrored from MMM-MyScoreboard.js):
//   0 = scheduled / future
//   1 = in progress
//   2 = final
function game(opts) {
  return {
    hTeam: opts.h,
    vTeam: opts.v,
    gameMode: opts.gameMode,
  }
}

describe('getEligibleUpcomingTeams (PR #198)', () => {
  it('returns [] when followedTeams[label] missing', () => {
    const inst = makeInstance(def, { followedTeams: {} })
    assert.deepEqual(inst.getEligibleUpcomingTeams('NHL'), [])
  })

  it('returns [] when followedTeams[label] is empty', () => {
    const inst = makeInstance(def, { followedTeams: { NHL: [] } })
    assert.deepEqual(inst.getEligibleUpcomingTeams('NHL'), [])
  })

  it('returns followed team when sportsData[label] is missing (no games today)', () => {
    const inst = makeInstance(def, {
      followedTeams: { NHL: ['TOR'] },
      sportsData: {},
    })
    assert.deepEqual(inst.getEligibleUpcomingTeams('NHL'), ['TOR'])
  })

  it('returns team when no games for that team today', () => {
    const inst = makeInstance(def, {
      followedTeams: { NHL: ['TOR'] },
      sportsData: { NHL: { scores: [game({ h: 'MTL', v: 'BOS', gameMode: 1 })] } },
    })
    assert.deepEqual(inst.getEligibleUpcomingTeams('NHL'), ['TOR'])
  })

  it('returns team when their single game today is FINAL', () => {
    const inst = makeInstance(def, {
      followedTeams: { NHL: ['TOR'] },
      sportsData: { NHL: { scores: [game({ h: 'TOR', v: 'MTL', gameMode: 2 })] } },
    })
    assert.deepEqual(inst.getEligibleUpcomingTeams('NHL'), ['TOR'])
  })

  it('omits team when their game is IN_PROGRESS (gameMode 1)', () => {
    const inst = makeInstance(def, {
      followedTeams: { NHL: ['TOR'] },
      sportsData: { NHL: { scores: [game({ h: 'TOR', v: 'MTL', gameMode: 1 })] } },
    })
    assert.deepEqual(inst.getEligibleUpcomingTeams('NHL'), [])
  })

  it('omits team when their game is scheduled but not started (gameMode 0)', () => {
    const inst = makeInstance(def, {
      followedTeams: { NHL: ['TOR'] },
      sportsData: { NHL: { scores: [game({ h: 'TOR', v: 'MTL', gameMode: 0 })] } },
    })
    assert.deepEqual(inst.getEligibleUpcomingTeams('NHL'), [])
  })

  it('MLB doubleheader: both games FINAL → eligible', () => {
    const inst = makeInstance(def, {
      followedTeams: { MLB: ['NYY'] },
      sportsData: { MLB: { scores: [
        game({ h: 'NYY', v: 'BOS', gameMode: 2 }),
        game({ h: 'BOS', v: 'NYY', gameMode: 2 }),
      ] } },
    })
    assert.deepEqual(inst.getEligibleUpcomingTeams('MLB'), ['NYY'])
  })

  it('MLB doubleheader: one FINAL, one IN_PROGRESS → NOT eligible', () => {
    const inst = makeInstance(def, {
      followedTeams: { MLB: ['NYY'] },
      sportsData: { MLB: { scores: [
        game({ h: 'NYY', v: 'BOS', gameMode: 2 }),
        game({ h: 'BOS', v: 'NYY', gameMode: 1 }),
      ] } },
    })
    assert.deepEqual(inst.getEligibleUpcomingTeams('MLB'), [])
  })

  it('skips @T25 group marker without crashing', () => {
    const inst = makeInstance(def, {
      followedTeams: { NCAAF: ['@T25', 'OSU'] },
      sportsData: { NCAAF: { scores: [] } },
    })
    // @T25 is skipped; OSU has no games today → eligible.
    assert.deepEqual(inst.getEligibleUpcomingTeams('NCAAF'), ['OSU'])
  })

  it('returns each eligible team in followed order', () => {
    const inst = makeInstance(def, {
      followedTeams: { NHL: ['TOR', 'MTL', 'BOS'] },
      sportsData: { NHL: { scores: [
        game({ h: 'TOR', v: 'OTT', gameMode: 1 }), // TOR in progress → omit
        game({ h: 'BOS', v: 'NYR', gameMode: 2 }), // BOS final → include
        // MTL has no games today → include
      ] } },
    })
    assert.deepEqual(inst.getEligibleUpcomingTeams('NHL'), ['MTL', 'BOS'])
  })
})
