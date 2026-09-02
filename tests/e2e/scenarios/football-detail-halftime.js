'use strict'

const { espnScoreboardRoute, todayMidLocalISO, team, TEAMS } = require('./_shared')

module.exports = {
  name: 'football-detail-halftime',
  moduleConfig: {
    viewStyle: 'largeLogos',
    showLeagueSeparators: true,
    colored: true,
    highlightWinners: true,
    showDetail: true,
    detailViewOverride: true,
    sports: [{ league: 'NFL', teams: ['DAL'] }],
  },
  fixtures: {
    [espnScoreboardRoute('football/nfl')]: {
      events: [{
        id: 'nfl-live-halftime',
        date: todayMidLocalISO(),
        status: { type: { id: '23', detail: 'Halftime', shortDetail: 'Halftime', description: 'Halftime' } },
        competitions: [{
          date: todayMidLocalISO(),
          status: { type: { id: '23', detail: 'Halftime', shortDetail: 'Halftime', description: 'Halftime' } },
          broadcasts: [],
          situation: {
            homeTimeouts: 3,
            awayTimeouts: 3,
          },
          competitors: [
            { homeAway: 'home', score: '10', id: '6', team: { ...team(TEAMS.DAL), id: '6' } },
            { homeAway: 'away', score: '13', id: '21', team: { ...team(TEAMS.PHL), id: '21' } },
          ],
        }],
      }],
    },
  },
  assertions: [async (page, expect) => {
    await expect(page.locator('.MMM-MyScoreboard .football-field')).toHaveCount(0)
    await expect(page.locator('.MMM-MyScoreboard .box-score.football-has-field')).toHaveCount(0)
    await expect(page.locator('.MMM-MyScoreboard .football-timeouts')).toHaveCount(2)
  }],
}
