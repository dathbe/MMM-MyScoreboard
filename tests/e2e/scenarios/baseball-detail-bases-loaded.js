'use strict'

const { espnScoreboardRoute, mlbFreeGameRoute, todayMidLocalISO, team, TEAMS } = require('./_shared')

module.exports = {
  name: 'baseball-detail-bases-loaded',
  moduleConfig: {
    viewStyle: 'largeLogos',
    showLeagueSeparators: true,
    colored: true,
    highlightWinners: true,
    showBaseballDetail: true,
    baseballDetailViewOverride: true,
    sports: [{ league: 'MLB', teams: ['NYY'] }],
  },
  fixtures: {
    [mlbFreeGameRoute()]: { results: [] },
    [espnScoreboardRoute('baseball/mlb')]: {
      events: [{
        id: 'mlb-bases-loaded',
        date: todayMidLocalISO(),
        status: { type: { id: '2', detail: 'In Progress', shortDetail: 'Top 9th', description: 'In Progress' } },
        competitions: [{
          date: todayMidLocalISO(),
          status: { type: { id: '2', detail: 'In Progress', shortDetail: 'Top 9th', description: 'In Progress' } },
          broadcasts: [],
          situation: {
            balls: 3,
            strikes: 2,
            outs: 2,
            onFirst: true,
            onSecond: true,
            onThird: true,
            pitcher: { athlete: { shortName: 'C. Kimbrel' } },
            batter: { athlete: { shortName: 'A. Judge' } },
          },
          competitors: [
            { homeAway: 'home', score: '5', team: team(TEAMS.RED) },
            { homeAway: 'away', score: '4', team: team(TEAMS.NYY) },
          ],
        }],
      }],
    },
  },
}
