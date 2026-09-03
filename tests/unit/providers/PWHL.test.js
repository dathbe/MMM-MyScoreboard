'use strict'

const { describe, it, beforeEach, afterEach } = require('node:test')
const assert = require('node:assert/strict')
const path = require('path')
const moment = require('moment-timezone')

const PWHL = require(path.resolve(__dirname, '../../../providers/PWHL.js'))
const { mockFetch } = require('../../helpers/mock-fetch')

/*
  Issue #205: the PWHL playoffs live under their OWN HockeyTech season id,
  and scheduled games carry EST as well as EDT time suffixes. Fixtures
  mirror the real feeds (modulekit seasons JSON + statviewfeed JSONP).
*/

const SEASONS_URL = 'https://lscluster.hockeytech.com/feed/index.php?feed=modulekit&view=seasons&key=446521baf8c38984&client_code=pwhl&fmt=json'

function scheduleUrl(seasonId) {
  return `https://lscluster.hockeytech.com/feed/index.php?feed=statviewfeed&view=schedule&team=-1&season=${seasonId}&month=-1&location=homeaway&key=446521baf8c38984&client_code=pwhl&site_id=0&league_id=1&conference_id=-1&division_id=-1&lang=en&callback=angular.callbacks._2`
}

const SEASONS = {
  SiteKit: {
    Seasons: [
      { season_id: '10', season_name: '2026-27 Pre-Season', career: '0', playoff: '0', start_date: '2026-10-01', end_date: '2026-11-30' },
      { season_id: '9', season_name: '2026 Playoffs', career: '1', playoff: '1', start_date: '2026-04-28', end_date: '2026-05-28' },
      { season_id: '8', season_name: '2025-26 Regular Season', career: '1', playoff: '0', start_date: '2025-11-21', end_date: '2026-04-27' },
    ],
  },
}

function jsonp(rows) {
  const payload = [{ sections: [{ data: rows.map(r => ({ row: r })) }] }]
  return `angular.callbacks._2(${JSON.stringify(payload)})`
}

function row(date, home, away, status, hScore = '0', vScore = '0') {
  return {
    date_with_day: date,
    home_team_city: home,
    visiting_team_city: away,
    game_status: status,
    home_goal_count: hScore,
    visiting_goal_count: vScore,
  }
}

function getScoresOnce(gameDate, teams = null) {
  return new Promise((resolve) => {
    let done = false
    PWHL.getScores({ league: 'PWHL', teams, index: 0 }, gameDate, (scores, idx, noGames) => {
      done = true
      resolve({ called: true, scores, noGames })
    })
    setTimeout(() => {
      if (!done) resolve({ called: false })
    }, 5000)
  })
}

describe('PWHL provider (issue #205)', () => {
  let mock

  beforeEach(() => {
    PWHL.body = null
    PWHL.noGamesToday = false
    PWHL.seasonsCache = null
    if (PWHL.pollTimer) clearTimeout(PWHL.pollTimer)
    mock = mockFetch()
    mock.route(SEASONS_URL, SEASONS)
  })

  afterEach(() => {
    if (PWHL.pollTimer) clearTimeout(PWHL.pollTimer)
    mock.restore()
  })

  describe('selectSeason', () => {
    it('regular-season date maps to the regular season id', () => {
      const s = PWHL.selectSeason(SEASONS.SiteKit.Seasons, moment('2026-01-15'))
      assert.equal(s.season_id, '8')
    })

    it('playoff date maps to the playoff season id', () => {
      const s = PWHL.selectSeason(SEASONS.SiteKit.Seasons, moment('2026-05-10'))
      assert.equal(s.season_id, '9')
    })

    it('off-season date maps to no season', () => {
      assert.equal(PWHL.selectSeason(SEASONS.SiteKit.Seasons, moment('2026-07-15')), null)
    })

    it('prefers the playoff season when windows overlap', () => {
      const overlapping = SEASONS.SiteKit.Seasons.concat([
        { season_id: '99', career: '1', playoff: '0', start_date: '2026-04-01', end_date: '2026-06-01' },
      ])
      const s = PWHL.selectSeason(overlapping, moment('2026-05-10'))
      assert.equal(s.season_id, '9')
    })
  })

  describe('playoff games (separate season id)', () => {
    it('fetches the playoff season schedule and returns the game', async () => {
      mock.route(scheduleUrl('9'), jsonp([
        row('Thu, Apr 30', 'Boston', 'Ottawa', 'Final', '3', '2'),
      ]))

      const r = await getScoresOnce(moment('2026-04-30'))
      assert.equal(r.called, true)
      assert.equal(r.scores.length, 1)
      assert.equal(r.scores[0].hTeam, 'Boston')
      assert.equal(r.scores[0].gameMode, 2)
      assert.equal(mock.hits(scheduleUrl('9')), 1)
    })
  })

  describe('scheduled game statuses', () => {
    it('EST-suffixed times are scheduled games, not in-progress (winter)', async () => {
      mock.route(scheduleUrl('8'), jsonp([
        row('Sat, Jan 10', 'Montreal', 'Toronto', '7:00 pm EST'),
      ]))

      const r = await getScoresOnce(moment('2026-01-10'))
      assert.equal(r.scores.length, 1)
      assert.equal(r.scores[0].gameMode, 0)
      assert.notEqual(r.scores[0].status[0], '7:00 pm EST')
    })

    it('EDT-suffixed times are scheduled games (fall/spring)', async () => {
      mock.route(scheduleUrl('8'), jsonp([
        row('Fri, Apr 10', 'Minnesota', 'Boston', '7:00 pm EDT'),
      ]))

      const r = await getScoresOnce(moment('2026-04-10'))
      assert.equal(r.scores[0].gameMode, 0)
    })

    it('anything else is treated as in-progress', async () => {
      mock.route(scheduleUrl('8'), jsonp([
        row('Sat, Jan 10', 'Montreal', 'Toronto', '2nd 8:43'),
      ]))

      const r = await getScoresOnce(moment('2026-01-10'))
      assert.equal(r.scores[0].gameMode, 1)
      assert.equal(r.scores[0].status[0], '2nd 8:43')
    })
  })

  describe('year attribution from the season window', () => {
    it('January dates use the season end year, November the start year', async () => {
      mock.route(scheduleUrl('8'), jsonp([
        row('Sat, Nov 22', 'Ottawa', 'Boston', 'Final', '2', '1'),
        row('Sat, Jan 10', 'Montreal', 'Toronto', 'Final', '4', '3'),
      ]))

      const jan = await getScoresOnce(moment('2026-01-10'))
      assert.equal(jan.scores.length, 1)
      assert.equal(jan.scores[0].hTeam, 'Montreal')

      PWHL.body = null
      PWHL.seasonsCache = null
      const nov = await getScoresOnce(moment('2025-11-22'))
      assert.equal(nov.scores.length, 1)
      assert.equal(nov.scores[0].hTeam, 'Ottawa')
    })
  })

  describe('off-season and failure behavior', () => {
    it('off-season date yields no games without fetching a schedule', async () => {
      const r = await getScoresOnce(moment('2026-07-15'))
      assert.equal(r.called, true)
      assert.deepEqual(r.scores, [])
      assert.equal(r.noGames, true)
    })

    it('schedule fetch failure yields empty scores, not a hang', async () => {
      mock.setError(scheduleUrl('8'), new Error('ECONNREFUSED'))

      const r = await getScoresOnce(moment('2026-01-10'))
      assert.equal(r.called, true)
      assert.deepEqual(r.scores, [])
    })
  })
})
