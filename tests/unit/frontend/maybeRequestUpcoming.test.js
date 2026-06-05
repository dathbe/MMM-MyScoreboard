'use strict'

const { describe, it, before, beforeEach, afterEach } = require('node:test')
const assert = require('node:assert/strict')

const { loadFrontend, makeInstance } = require('../../helpers/load-frontend')
const { setFakeNow, restore } = require('../../helpers/time-control')

let def
before(() => {
  def = loadFrontend().def
})

afterEach(() => restore())

/*
  PR #198 — maybeRequestUpcoming throttle & gating.

  Required state on instance:
    config.rolloverHours, config.alwaysShowToday, config.debugHours, config.debugMinutes,
    config.sports[], supportedLeagues[league].provider, followedTeams, sportsData
*/

function setup(opts = {}) {
  return makeInstance(def, {
    config: Object.assign({
      rolloverHours: 4,
      alwaysShowToday: false,
      debugHours: 0,
      debugMinutes: 0,
      sports: [{ league: 'NHL', teams: ['TOR'] }],
    }, opts.config ?? {}),
    followedTeams: opts.followedTeams ?? { NHL: ['TOR'] },
    sportsData: opts.sportsData ?? { NHL: { scores: [] } },
    supportedLeagues: opts.supportedLeagues ?? { NHL: { provider: 'ESPN' } },
    upcomingGames: opts.upcomingGames ?? {},
    upcomingRequestedAt: opts.upcomingRequestedAt ?? {},
    upcomingRequestedTeams: opts.upcomingRequestedTeams ?? {},
  })
}

// The rollover check compares the *local* hour against config.rolloverHours.
// To stay timezone-independent, tests bump config.rolloverHours above the
// current local hour rather than pinning wall-clock time.
const moment = require('moment-timezone')

function currentLocalHour() {
  return moment().hour()
}

describe('maybeRequestUpcoming (PR #198)', () => {
  beforeEach(() => {
    setFakeNow('2025-10-15T12:00:00Z')
  })

  it('skips when current hour < rolloverHours and !alwaysShowToday', () => {
    const tooLate = (currentLocalHour() + 2) % 24 + 24 // always > nowHour
    const inst = setup({
      config: {
        rolloverHours: tooLate, alwaysShowToday: false,
        sports: [{ league: 'NHL', teams: ['TOR'] }],
      },
      sportsData: { NHL: { scores: [{ hTeam: 'TOR', vTeam: 'MTL', gameMode: 2 }] } },
    })
    inst.maybeRequestUpcoming('NHL', 0)
    assert.equal(inst.sentNotifications.length, 0)
  })

  it('proceeds when current hour < rolloverHours but alwaysShowToday is true', () => {
    const tooLate = (currentLocalHour() + 2) % 24 + 24
    const inst = setup({
      config: {
        rolloverHours: tooLate, alwaysShowToday: true,
        sports: [{ league: 'NHL', teams: ['TOR'] }],
      },
      sportsData: { NHL: { scores: [{ hTeam: 'TOR', vTeam: 'MTL', gameMode: 2 }] } },
    })
    inst.maybeRequestUpcoming('NHL', 0)
    assert.equal(inst.sentNotifications.length, 1)
    assert.equal(inst.sentNotifications[0].notification, 'MMM-MYSCOREBOARD-GET-UPCOMING')
  })

  it('skips when label not found in config.sports', () => {
    const inst = setup({
      config: { sports: [{ league: 'MLB', teams: ['NYY'] }] },
    })
    inst.maybeRequestUpcoming('NHL', 0)
    assert.equal(inst.sentNotifications.length, 0)
  })

  it('skips when provider is not ESPN', () => {
    const inst = setup({
      supportedLeagues: { NHL: { provider: 'PWHL' } },
    })
    inst.maybeRequestUpcoming('NHL', 0)
    assert.equal(inst.sentNotifications.length, 0)
  })

  it('deletes prior upcomingGames[label] when eligible becomes empty', () => {
    const inst = setup({
      sportsData: { NHL: { scores: [
        { hTeam: 'TOR', vTeam: 'MTL', gameMode: 1 }, // in-progress → not eligible
      ] } },
      upcomingGames: { NHL: { TOR: { hTeam: 'TOR' } } },
    })
    inst.maybeRequestUpcoming('NHL', 0)
    assert.equal(inst.upcomingGames.NHL, undefined)
    assert.equal(inst.sentNotifications.length, 0)
    assert.equal(inst.domUpdated, 1)
  })

  it('sends GET-UPCOMING with expected payload', () => {
    const inst = setup({
      sportsData: { NHL: { scores: [
        { hTeam: 'TOR', vTeam: 'MTL', gameMode: 2 },
      ] } },
    })
    inst.maybeRequestUpcoming('NHL', 2)
    assert.equal(inst.sentNotifications.length, 1)
    const { notification, payload } = inst.sentNotifications[0]
    assert.equal(notification, 'MMM-MYSCOREBOARD-GET-UPCOMING')
    assert.equal(payload.instanceId, inst.identifier)
    assert.equal(payload.label, 'NHL')
    assert.equal(payload.league, 'NHL')
    assert.equal(payload.provider, 'ESPN')
    assert.equal(payload.sortIdx, 2)
    assert.deepEqual(payload.teams, ['TOR'])
    assert.equal(payload.debugHours, 0)
    assert.equal(payload.debugMinutes, 0)
  })

  it('forwards debugHours/Minutes from config', () => {
    const inst = setup({
      config: {
        rolloverHours: 4, alwaysShowToday: false,
        debugHours: 5, debugMinutes: 30,
        sports: [{ league: 'NHL', teams: ['TOR'] }],
      },
    })
    inst.maybeRequestUpcoming('NHL', 0)
    const p = inst.sentNotifications[0].payload
    assert.equal(p.debugHours, 5)
    assert.equal(p.debugMinutes, 30)
  })

  it('throttle: second identical call within 30 min is suppressed', () => {
    const inst = setup({
      sportsData: { NHL: { scores: [{ hTeam: 'TOR', vTeam: 'MTL', gameMode: 2 }] } },
    })
    inst.maybeRequestUpcoming('NHL', 0)
    assert.equal(inst.sentNotifications.length, 1)
    inst.maybeRequestUpcoming('NHL', 0)
    assert.equal(inst.sentNotifications.length, 1)
  })

  it('throttle resets after 30 min', () => {
    setFakeNow('2025-10-15T12:00:00Z')
    const inst = setup({
      sportsData: { NHL: { scores: [{ hTeam: 'TOR', vTeam: 'MTL', gameMode: 2 }] } },
    })
    inst.maybeRequestUpcoming('NHL', 0)
    assert.equal(inst.sentNotifications.length, 1)
    setFakeNow('2025-10-15T12:31:00Z') // 31 min later
    inst.maybeRequestUpcoming('NHL', 0)
    assert.equal(inst.sentNotifications.length, 2)
  })

  it('throttle bypassed when eligible team set changes', () => {
    // Start: TOR has a final + BOS has an in-progress → only TOR eligible.
    const inst = setup({
      followedTeams: { NHL: ['TOR', 'BOS'] },
      sportsData: { NHL: { scores: [
        { hTeam: 'TOR', vTeam: 'MTL', gameMode: 2 },
        { hTeam: 'BOS', vTeam: 'NYR', gameMode: 1 },
      ] } },
    })
    inst.maybeRequestUpcoming('NHL', 0)
    assert.equal(inst.sentNotifications.length, 1)
    assert.deepEqual(inst.sentNotifications[0].payload.teams, ['TOR'])

    // Same call again — same teams → throttled
    inst.maybeRequestUpcoming('NHL', 0)
    assert.equal(inst.sentNotifications.length, 1)

    // Flip BOS to final → eligible becomes ['TOR', 'BOS']
    inst.sportsData.NHL.scores[1].gameMode = 2
    inst.maybeRequestUpcoming('NHL', 0)
    assert.equal(inst.sentNotifications.length, 2)
    assert.deepEqual(inst.sentNotifications[1].payload.teams.sort(), ['BOS', 'TOR'])
  })

  it('uses sport.label fallback to sport.league for matching', () => {
    const inst = setup({
      config: {
        rolloverHours: 4, alwaysShowToday: false,
        sports: [{ league: 'NHL', label: 'Hockey', teams: ['TOR'] }],
      },
      followedTeams: { Hockey: ['TOR'] },
      sportsData: { Hockey: { scores: [{ hTeam: 'TOR', vTeam: 'MTL', gameMode: 2 }] } },
    })
    inst.maybeRequestUpcoming('Hockey', 0)
    assert.equal(inst.sentNotifications.length, 1)
  })
})
