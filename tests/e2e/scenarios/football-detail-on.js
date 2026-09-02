'use strict'

const { espnScoreboardRoute, todayMidLocalISO, team, TEAMS } = require('./_shared')

module.exports = {
  name: 'football-detail-on',
  moduleConfig: {
    viewStyle: 'largeLogos',
    showLeagueSeparators: true,
    colored: true,
    highlightWinners: true,
    showFootballDetail: true,
    footballDetailViewOverride: true,
    sports: [{ league: 'NFL', teams: ['DAL'] }],
  },
  fixtures: {
    [espnScoreboardRoute('football/nfl')]: {
      events: [{
        id: 'nfl-live-detail',
        date: todayMidLocalISO(),
        status: { type: { id: '2', detail: 'In Progress', shortDetail: '2nd 8:42', description: 'In Progress' } },
        competitions: [{
          date: todayMidLocalISO(),
          status: { type: { id: '2', detail: 'In Progress', shortDetail: '2nd 8:42', description: 'In Progress' } },
          broadcasts: [],
          situation: {
            down: 2,
            distance: 7,
            yardLine: 78,
            downDistanceText: '2nd & 7 at DAL 22',
            shortDownDistanceText: '2nd & 7',
            possessionText: 'DAL 22',
            possession: '6',
            isRedZone: false,
            homeTimeouts: 3,
            awayTimeouts: 2,
            lastPlay: { id: '1', text: 'D. Prescott pass short right to C. Lamb for 9 yards (Q. Diggs)' },
          },
          competitors: [
            { homeAway: 'home', score: '14', id: '6', team: { ...team(TEAMS.DAL), id: '6' } },
            { homeAway: 'away', score: '10', id: '21', team: { ...team(TEAMS.PHL), id: '21' } },
          ],
        }],
      }],
    },
  },
  assertions: [async (page, expect) => {
    const ball = page.locator('.MMM-MyScoreboard .field-ball')
    await expect(ball).toHaveCount(1)
    expect(await ball.evaluate(el => el.style.getPropertyValue('--ball-x'))).toBe('78%')
    await expect(page.locator('.MMM-MyScoreboard .field-first-down')).toHaveCount(1)
    await expect(page.locator('.MMM-MyScoreboard .football-last-play')).toHaveCount(0)
  }],
}
