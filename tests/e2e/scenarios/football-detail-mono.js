'use strict'

const { espnScoreboardRoute, todayMidLocalISO, team, TEAMS } = require('./_shared')

module.exports = {
  name: 'football-detail-mono',
  moduleConfig: {
    viewStyle: 'largeLogos',
    showLeagueSeparators: true,
    colored: false,
    highlightWinners: true,
    showDetail: true,
    detailViewOverride: true,
    sports: [{ league: 'NFL', teams: ['DAL'] }],
  },
  fixtures: {
    [espnScoreboardRoute('football/nfl')]: {
      events: [{
        id: 'nfl-live-mono',
        date: todayMidLocalISO(),
        status: { type: { id: '2', detail: 'In Progress', shortDetail: '2nd 8:42', description: 'In Progress' } },
        competitions: [{
          date: todayMidLocalISO(),
          status: { type: { id: '2', detail: 'In Progress', shortDetail: '2nd 8:42', description: 'In Progress' } },
          broadcasts: [],
          situation: {
            down: 2,
            distance: 7,
            downDistanceText: '2nd & 7 at DAL 22',
            shortDownDistanceText: '2nd & 7',
            possessionText: 'DAL 22',
            possession: '6',
            isRedZone: false,
            homeTimeouts: 3,
            awayTimeouts: 2,
            lastPlay: { id: '1', text: 'D. Prescott pass short right to C. Lamb for 9 yards' },
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
    // Full mono: gray ball, gray turf, gray first-down line — no color leak
    expect(await ball.evaluate(el => getComputedStyle(el).backgroundColor)).toBe('rgb(204, 204, 204)')
    expect(await page.locator('.MMM-MyScoreboard .football-field').evaluate(el => getComputedStyle(el).backgroundColor)).toBe('rgb(36, 36, 36)')
    expect(await page.locator('.MMM-MyScoreboard .field-first-down').evaluate(el => getComputedStyle(el).backgroundColor)).toBe('rgb(204, 204, 204)')
  }],
}
