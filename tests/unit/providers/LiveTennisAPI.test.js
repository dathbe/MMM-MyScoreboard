'use strict'

const { describe, it, beforeEach, afterEach } = require('node:test')
const assert = require('node:assert/strict')
const path = require('node:path')
const moment = require('moment-timezone')

const LiveTennisAPI = require(path.resolve(__dirname, '../../../providers/LiveTennisAPI.js'))
const { mockFetch } = require('../../helpers/mock-fetch')

const BASE = 'https://api.livetennisapi.com/api/public/v1/matches'
const url = (status, tour) => `${BASE}?status=${status}&tour=${tour}&limit=50`

function resetProvider() {
  LiveTennisAPI.scores = {}
  LiveTennisAPI.tours = null
  LiveTennisAPI.pollStarted = false
  LiveTennisAPI.keyWarningLogged = false
}

describe('LiveTennisAPI provider', () => {
  let mock

  beforeEach(() => {
    mock = mockFetch()
    resetProvider()
    process.env.LIVETENNIS_API_KEY = 'twjp_test'
  })

  afterEach(() => {
    mock.restore()
    delete process.env.LIVETENNIS_API_KEY
  })

  describe('normalizeMatch', () => {
    it('maps a live match into the module game shape', () => {
      const g = LiveTennisAPI.normalizeMatch({
        id: 1,
        status: 'live',
        start_time: '2025-08-18T13:00:00Z',
        players: [
          { name: 'Carlos Alcaraz', serving: true, sets: [6, 3, 2], points: '40' },
          { name: 'Jannik Sinner', serving: false, sets: [4, 6, 1], points: '30' },
        ],
      })
      assert.equal(g.gameMode, 1)
      assert.equal(g.hTeam, 'Alcaraz')
      assert.equal(g.vTeam, 'Sinner')
      assert.equal(g.hTeamLong, 'Carlos Alcaraz')
      assert.equal(g.hScore, 1) // Alcaraz won set 1 (6-4)
      assert.equal(g.vScore, 1) // Sinner won set 2 (6-3)
      assert.ok(g.status.includes('6-4 3-6 2-1'))
      assert.ok(g.status.includes('40-30'))
      assert.ok(g.status.includes('Serving: Alcaraz'))
    })

    it('marks completed matches as FINAL', () => {
      const g = LiveTennisAPI.normalizeMatch({
        status: 'completed',
        start_time: '2025-08-18T13:00:00Z',
        players: [
          { name: 'Iga Swiatek', sets: [6, 6] },
          { name: 'Coco Gauff', sets: [4, 2] },
        ],
      })
      assert.equal(g.gameMode, 2)
      assert.equal(g.hScore, 2)
      assert.equal(g.vScore, 0)
      assert.equal(g.status[0], 'Final')
    })

    it('marks upcoming matches as FUTURE with no set score', () => {
      const g = LiveTennisAPI.normalizeMatch({
        status: 'upcoming',
        start_time: '2025-08-18T13:00:00Z',
        players: [
          { name: 'Novak Djokovic' },
          { name: 'Daniil Medvedev' },
        ],
      })
      assert.equal(g.gameMode, 0)
      assert.equal(g.hScore, 0)
      assert.equal(g.vScore, 0)
    })

    it('tolerates flat home/away and full_name fields', () => {
      const g = LiveTennisAPI.normalizeMatch({
        status: 'live',
        home: { full_name: 'Aryna Sabalenka', sets: [6], serving: true },
        away: { full_name: 'Elena Rybakina', sets: [3] },
      })
      assert.equal(g.hTeamLong, 'Aryna Sabalenka')
      assert.equal(g.vTeamLong, 'Elena Rybakina')
    })

    it('skips malformed entries', () => {
      assert.equal(LiveTennisAPI.normalizeMatch(null), null)
      assert.equal(LiveTennisAPI.normalizeMatch({ players: [{ name: 'Solo' }] }), null)
    })
  })

  describe('setsWon', () => {
    it('does not count an unfinished set or a running tiebreak', () => {
      assert.equal(LiveTennisAPI.setsWon([6, 2], [4, 1]), 1) // only set 1 decided
      assert.equal(LiveTennisAPI.setsWon([7, 6], [6, 6]), 1) // 7-6 counts, 6-6 does not
    })
  })

  describe('getData', () => {
    it('fetches live, upcoming and completed for each registered tour', async () => {
      mock.route(url('live', 'atp'), { data: [{ status: 'live', players: [{ name: 'A B', sets: [6] }, { name: 'C D', sets: [3] }] }] })
      mock.route(url('upcoming', 'atp'), { data: [] })
      mock.route(url('completed', 'atp'), { data: [] })

      LiveTennisAPI.registerTour('atp')
      await LiveTennisAPI.getData()

      assert.equal(mock.hits(url('live', 'atp')), 1)
      assert.equal(mock.hits(url('upcoming', 'atp')), 1)
      assert.equal(mock.hits(url('completed', 'atp')), 1)
      assert.equal(LiveTennisAPI.scores.atp.length, 1)
    })

    it('leaves an empty slate (no throw) when there is no API key', async () => {
      delete process.env.LIVETENNIS_API_KEY
      LiveTennisAPI.registerTour('atp')
      await LiveTennisAPI.getData()
      assert.deepEqual(LiveTennisAPI.scores.atp, [])
    })

    it('keeps prior data on fetch error', async () => {
      LiveTennisAPI.scores.atp = [{ hTeam: 'X' }]
      mock.setError(url('live', 'atp'), new Error('network down'))
      mock.route(url('upcoming', 'atp'), { data: [] })
      mock.route(url('completed', 'atp'), { data: [] })
      LiveTennisAPI.registerTour('atp')
      await LiveTennisAPI.getData()
      assert.equal(LiveTennisAPI.scores.atp.length, 1)
    })
  })

  describe('getGames', () => {
    it('filters by player surname and by day', () => {
      const today = moment().format('YYYY-MM-DD')
      LiveTennisAPI.scores.wta = [
        { hTeamLong: 'Coco Gauff', vTeamLong: 'Iga Swiatek', startTime: `${today}T13:00:00Z` },
        { hTeamLong: 'Aryna Sabalenka', vTeamLong: 'Elena Rybakina', startTime: `${today}T13:00:00Z` },
      ]
      const got = LiveTennisAPI.getGames('wta', ['Gauff'], moment())
      assert.equal(got.length, 1)
      assert.equal(got[0].hTeamLong, 'Coco Gauff')
    })

    it('returns all games for the day when no teams are configured', () => {
      const today = moment().format('YYYY-MM-DD')
      LiveTennisAPI.scores.atp = [
        { hTeamLong: 'A B', vTeamLong: 'C D', startTime: `${today}T13:00:00Z` },
        { hTeamLong: 'E F', vTeamLong: 'G H', startTime: `${today}T13:00:00Z` },
      ]
      assert.equal(LiveTennisAPI.getGames('atp', null, moment()).length, 2)
    })

    it('does not surface today\'s matches on yesterday\'s request', () => {
      const today = moment().format('YYYY-MM-DD')
      LiveTennisAPI.scores.atp = [
        { hTeamLong: 'A B', vTeamLong: 'C D', startTime: `${today}T13:00:00Z` },
      ]
      const yesterday = moment().subtract(1, 'day')
      assert.equal(LiveTennisAPI.getGames('atp', null, yesterday).length, 0)
    })
  })
})
