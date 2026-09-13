'use strict'

const { describe, it, beforeEach, afterEach } = require('node:test')
const assert = require('node:assert/strict')
const path = require('node:path')
const moment = require('moment-timezone')

const LiveTennisAPI = require(path.resolve(__dirname, '../../../providers/LiveTennisAPI.js'))
const { mockFetch } = require('../../helpers/mock-fetch')

const LIVE_URL = 'https://api.livetennisapi.com/api/public/v1/matches?status=live&limit=200'
const UPCOMING_URL = 'https://api.livetennisapi.com/api/public/v1/matches?status=upcoming&limit=200'

function liveMatch(overrides = {}) {
  return {
    id: 1,
    tour: 'atp',
    tournament: 'Test Open',
    status: 'live',
    event_status: null,
    scheduled_time: null,
    round: 'QF',
    players: {
      p1: { name: 'Carlos Alcaraz' },
      p2: { name: 'Novak Djokovic' },
    },
    score: {
      sets: [1, 0],
      games: [[6, 2], [4, 1]],
      points: ['40', '30'],
      server: 1,
      is_tiebreak: false,
    },
    ...overrides,
  }
}

describe('LiveTennisAPI provider', () => {
  let mock

  beforeEach(() => {
    mock = mockFetch()
    LiveTennisAPI.apiKey = 'test-key'
    LiveTennisAPI.matches = null
    LiveTennisAPI.dataOk = false
    LiveTennisAPI.dataPollStarted = false
  })

  afterEach(() => {
    mock.restore()
  })

  describe('getData', () => {
    it('combines live + upcoming and sets dataOk', async () => {
      mock.route(LIVE_URL, { data: [liveMatch()] })
      mock.route(UPCOMING_URL, { data: [{ id: 2, tour: 'wta', status: 'upcoming' }] })
      await LiveTennisAPI.getData()
      assert.equal(LiveTennisAPI.matches.length, 2)
      assert.equal(LiveTennisAPI.dataOk, true)
    })

    it('on HTTP error leaves dataOk false and unblocks with empty matches', async () => {
      mock.route(LIVE_URL, '', { status: 500 })
      mock.route(UPCOMING_URL, { data: [] })
      await LiveTennisAPI.getData()
      assert.deepEqual(LiveTennisAPI.matches, [])
      assert.equal(LiveTennisAPI.dataOk, false)
    })

    it('tolerates a missing data array', async () => {
      mock.route(LIVE_URL, {})
      mock.route(UPCOMING_URL, {})
      await LiveTennisAPI.getData()
      assert.deepEqual(LiveTennisAPI.matches, [])
      assert.equal(LiveTennisAPI.dataOk, true)
    })
  })

  describe('formatScores', () => {
    it('filters by tour (ATP excludes WTA)', () => {
      LiveTennisAPI.matches = [liveMatch(), liveMatch({ id: 3, tour: 'wta' })]
      LiveTennisAPI.dataOk = true
      const res = LiveTennisAPI.formatScores('ATP', null, moment())
      assert.equal(res.games.length, 1)
      assert.equal(res.noGamesToday, false)
    })

    it('TENNIS league returns all tours', () => {
      LiveTennisAPI.matches = [liveMatch(), liveMatch({ id: 3, tour: 'wta' })]
      LiveTennisAPI.dataOk = true
      assert.equal(LiveTennisAPI.formatScores('TENNIS', null, moment()).games.length, 2)
    })

    it('filters by player surname (case-insensitive)', () => {
      LiveTennisAPI.matches = [liveMatch()]
      LiveTennisAPI.dataOk = true
      assert.equal(LiveTennisAPI.formatScores('ATP', ['alcaraz'], moment()).games.length, 1)
      assert.equal(LiveTennisAPI.formatScores('ATP', ['Nadal'], moment()).games.length, 0)
    })

    it('reports noGamesToday only when the fetch succeeded', () => {
      LiveTennisAPI.matches = []
      LiveTennisAPI.dataOk = true
      assert.equal(LiveTennisAPI.formatScores('ATP', null, moment()).noGamesToday, true)
      LiveTennisAPI.dataOk = false
      assert.equal(LiveTennisAPI.formatScores('ATP', null, moment()).noGamesToday, false)
    })
  })

  describe('formatGame', () => {
    it('maps a live match to the module game object', () => {
      const g = LiveTennisAPI.formatGame(liveMatch())
      assert.equal(g.gameMode, 1)
      assert.equal(g.hScore, 1)
      assert.equal(g.vScore, 0)
      assert.equal(g.hTeam, 'Alcaraz •') // p1 serving
      assert.equal(g.vTeam, 'Djokovic')
      assert.deepEqual(g.status, ['6-4 2-1', '40-30'])
    })

    it('surfaces a break point on the status line', () => {
      const g = LiveTennisAPI.formatGame(liveMatch({
        score: { sets: [0, 0], games: [[3], [4]], points: ['30', '40'], server: 1, is_tiebreak: false },
      }))
      assert.ok(g.status.includes('BP'))
    })

    it('renders a tiebreak count and no break point', () => {
      const g = LiveTennisAPI.formatGame(liveMatch({
        score: { sets: [1, 1], games: [[6, 6], [6, 6]], points: ['5', '3'], server: 2, is_tiebreak: true },
      }))
      assert.deepEqual(g.status, ['6-6 6-6', 'TB 5-3'])
      assert.equal(g.vTeam, 'Djokovic •') // p2 serving
    })

    it('an upcoming match is FUTURE with no score and a round line', () => {
      const g = LiveTennisAPI.formatGame({
        id: 9, tour: 'atp', status: 'upcoming', round: 'SF',
        scheduled_time: moment.utc('2026-01-01T15:00:00Z').toISOString(),
        players: { p1: { name: 'Jannik Sinner' }, p2: { name: 'Taylor Fritz' } },
        score: null,
      })
      assert.equal(g.gameMode, 0)
      assert.equal(g.hScore, '')
      assert.equal(g.status[g.status.length - 1], 'SF')
    })
  })

  describe('isBreakPoint', () => {
    it('true when receiver holds AD', () => {
      assert.equal(LiveTennisAPI.isBreakPoint({ server: 1, points: ['40', 'AD'], is_tiebreak: false }), true)
    })
    it('true when receiver at 40 and server below 40', () => {
      assert.equal(LiveTennisAPI.isBreakPoint({ server: 2, points: ['40', '30'], is_tiebreak: false }), true)
    })
    it('false at deuce (40-40)', () => {
      assert.equal(LiveTennisAPI.isBreakPoint({ server: 1, points: ['40', '40'], is_tiebreak: false }), false)
    })
    it('false in a tiebreak', () => {
      assert.equal(LiveTennisAPI.isBreakPoint({ server: 1, points: ['3', '6'], is_tiebreak: true }), false)
    })
    it('false when server or points are unknown', () => {
      assert.equal(LiveTennisAPI.isBreakPoint({ server: null, points: ['0', 'AD'] }), false)
      assert.equal(LiveTennisAPI.isBreakPoint({ server: 1, points: ['40', null] }), false)
    })
  })
})
