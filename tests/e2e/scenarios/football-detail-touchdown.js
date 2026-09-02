'use strict'

const { espnScoreboardRoute, todayMidLocalISO, team, TEAMS } = require('./_shared')

module.exports = {
  name: 'football-detail-touchdown',
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
        id: 'nfl-live-touchdown',
        date: todayMidLocalISO(),
        status: { type: { id: '2', detail: 'In Progress', shortDetail: '3rd 5:12', description: 'In Progress' } },
        competitions: [{
          date: todayMidLocalISO(),
          status: { type: { id: '2', detail: 'In Progress', shortDetail: '3rd 5:12', description: 'In Progress' } },
          broadcasts: [],
          situation: {
            possession: '21',
            homeTimeouts: 2,
            awayTimeouts: 3,
            lastPlay: { id: '3', text: 'S. Barkley 20 yard rush, TOUCHDOWN' },
          },
          competitors: [
            { homeAway: 'home', score: '14', id: '6', team: { ...team(TEAMS.DAL), id: '6' } },
            { homeAway: 'away', score: '16', id: '21', team: { ...team(TEAMS.PHL), id: '21' } },
          ],
        }],
      }],
    },
  },
  assertions: [async (page, expect) => {
    // Field stays visible on a touchdown; ball parked in the scored end zone
    await expect(page.locator('.MMM-MyScoreboard .football-field')).toHaveCount(1)
    await expect(page.locator('.MMM-MyScoreboard .field-endzone.home .field-ball.in-endzone')).toHaveCount(1)
    await expect(page.locator('.MMM-MyScoreboard .field-play-area .field-ball')).toHaveCount(0)
    await expect(page.locator('.MMM-MyScoreboard .field-first-down')).toHaveCount(0)
    await expect(page.locator('.MMM-MyScoreboard .football-play-text')).toContainText('TOUCHDOWN')
  }],
}
