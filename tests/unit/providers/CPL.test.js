'use strict'

const { describe, it, beforeEach, afterEach } = require('node:test')
const assert = require('node:assert/strict')
const path = require('node:path')

const CPL = require(path.resolve(__dirname, '../../../providers/CPL.js'))
const { mockFetch } = require('../../helpers/mock-fetch')

const MATCHES_URL = 'https://api-sdp.canpl.ca/v1/cpl/football/seasons/cpl%3A%3AFootball_Season%3A%3Afd43e1d61dfe4396a7356bc432de0007/matches?locale=en-US'

describe('CPL provider', () => {
  let mock

  beforeEach(() => {
    mock = mockFetch()
    CPL.scoresObj = null
    CPL.dataPollStarted = false
  })

  afterEach(() => {
    mock.restore()
  })

  describe('getData', () => {
    it('parses matches into normalized shape', async () => {
      mock.route(MATCHES_URL, {
        matches: [{
          homeTeam: { mediaName: 'Forge', shortName: 'FFC', name: 'Forge FC', crest: 'http://x/forge.png' },
          awayTeam: { shortName: 'PFC', name: 'Pacific FC' },
          startDateUtc: '2025-08-15T23:00:00Z',
          score: { fullTime: { homeTeam: 3, awayTeam: 1 } },
        }],
      })
      await CPL.getData()
      assert.equal(CPL.scoresObj.length, 1)
      const g = CPL.scoresObj[0]
      assert.equal(g.homeTeam, 'Forge')
      assert.equal(g.awayTeam, 'PFC') // shortName preferred over name
      assert.equal(g.homeTeamLogoUrl, 'http://x/forge.png')
      assert.equal(g.awayTeamLogoUrl, null)
      assert.equal(g.homeScore, 3)
      assert.equal(g.awayScore, 1)
      assert.equal(g.gameMode, 2)
    })

    it('gameMode 0 (scheduled) when scores are null', async () => {
      mock.route(MATCHES_URL, {
        matches: [{
          homeTeam: { mediaName: 'Forge' },
          awayTeam: { mediaName: 'Pacific' },
          startDateUtc: '2025-08-15T23:00:00Z',
          score: { fullTime: { homeTeam: null, awayTeam: null } },
        }],
      })
      await CPL.getData()
      assert.equal(CPL.scoresObj[0].gameMode, 0)
    })

    it('falls back through mediaName → shortName → name', async () => {
      mock.route(MATCHES_URL, {
        matches: [{
          homeTeam: { name: 'Atlético Ottawa' }, // no mediaName, no shortName
          awayTeam: { mediaName: 'York', shortName: 'YU', name: 'York United' },
          startDateUtc: '2025-08-15T23:00:00Z',
          score: {},
        }],
      })
      await CPL.getData()
      assert.equal(CPL.scoresObj[0].homeTeam, 'Atlético Ottawa')
      assert.equal(CPL.scoresObj[0].awayTeam, 'York')
    })

    it('handles HTTP error without throwing (logs and leaves scoresObj null)', async () => {
      mock.route(MATCHES_URL, '', { status: 500 })
      await CPL.getData()
      assert.equal(CPL.scoresObj, null)
    })

    it('handles fetch reject without throwing', async () => {
      mock.setError(MATCHES_URL, new Error('network down'))
      await CPL.getData()
      assert.equal(CPL.scoresObj, null)
    })

    it('handles missing matches array', async () => {
      mock.route(MATCHES_URL, {})
      await CPL.getData()
      assert.deepEqual(CPL.scoresObj, [])
    })
  })

  describe('getLeague', () => {
    it('returns empty array when scoresObj is null', () => {
      CPL.scoresObj = null
      assert.deepEqual(CPL.getLeague(['Forge']), [])
    })

    it('filters by team list', () => {
      CPL.scoresObj = [
        { homeTeam: 'Forge', awayTeam: 'Pacific' },
        { homeTeam: 'York', awayTeam: 'Cavalry' },
      ]
      const got = CPL.getLeague(['Forge'])
      assert.equal(got.length, 1)
      assert.equal(got[0].homeTeam, 'Forge')
    })

    it('returns all games when teams is undefined', () => {
      CPL.scoresObj = [
        { homeTeam: 'Forge', awayTeam: 'Pacific' },
        { homeTeam: 'York', awayTeam: 'Cavalry' },
      ]
      assert.equal(CPL.getLeague(undefined).length, 2)
    })
  })
})
