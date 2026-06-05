'use strict'

const { espnScoreboardRoute, mlbFreeGameRoute, todayMidLocalISO, team, TEAMS } = require('./_shared')

module.exports = {
  name: 'baseball-detail-on',
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
        id: 'mlb-live-detail',
        date: todayMidLocalISO(),
        status: { type: { id: '2', detail: 'In Progress', shortDetail: 'Bot 7th', description: 'In Progress' } },
        competitions: [{
          date: todayMidLocalISO(),
          status: { type: { id: '2', detail: 'In Progress', shortDetail: 'Bot 7th', description: 'In Progress' } },
          broadcasts: [],
          situation: {
            balls: 2,
            strikes: 1,
            outs: 1,
            onFirst: true,
            onSecond: false,
            onThird: true,
            pitcher: { athlete: { shortName: 'G. Cole' } },
            batter: { athlete: { shortName: 'R. Devers' } },
          },
          competitors: [
            { homeAway: 'home', score: '4', team: team(TEAMS.NYY) },
            { homeAway: 'away', score: '3', team: team(TEAMS.RED) },
          ],
        }],
      }],
    },
  },
}
