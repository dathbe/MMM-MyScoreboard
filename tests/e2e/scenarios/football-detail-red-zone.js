'use strict'

const { espnScoreboardRoute, todayMidLocalISO, team, TEAMS } = require('./_shared')

module.exports = {
  name: 'football-detail-red-zone',
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
        id: 'nfl-live-red-zone',
        date: todayMidLocalISO(),
        status: { type: { id: '2', detail: 'In Progress', shortDetail: '4th 2:00', description: 'In Progress' } },
        competitions: [{
          date: todayMidLocalISO(),
          status: { type: { id: '2', detail: 'In Progress', shortDetail: '4th 2:00', description: 'In Progress' } },
          broadcasts: [],
          situation: {
            down: 1,
            distance: 4,
            yardLine: 96,
            downDistanceText: '1st & Goal at DAL 4',
            shortDownDistanceText: '1st & Goal',
            possessionText: 'DAL 4',
            possession: '21',
            isRedZone: true,
            homeTimeouts: 1,
            awayTimeouts: 0,
            lastPlay: { id: '2', text: 'J. Hurts scramble' },
          },
          competitors: [
            { homeAway: 'home', score: '20', id: '6', team: { ...team(TEAMS.DAL), id: '6' } },
            { homeAway: 'away', score: '17', id: '21', team: { ...team(TEAMS.PHL), id: '21' } },
          ],
        }],
      }],
    },
  },
  assertions: [async (page, expect) => {
    const ball = page.locator('.MMM-MyScoreboard .field-ball')
    await expect(ball).toHaveCount(1)
    expect(await ball.evaluate(el => el.style.getPropertyValue('--ball-x'))).toBe('96%')
    // Goal-to-go: first-down marker hidden (goal line is the marker)
    await expect(page.locator('.MMM-MyScoreboard .field-first-down')).toHaveCount(0)
  }],
}
