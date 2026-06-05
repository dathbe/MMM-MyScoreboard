'use strict'

const {
  espnScoreboardRoute, mlbFreeGameRoute, todayMidLocalISO, team, TEAMS,
} = require('./_shared')

module.exports = {
  name: 'state-mlb-in-progress',
  moduleConfig: {
    viewStyle: 'largeLogos',
    showLeagueSeparators: true,
    colored: true,
    sports: [{ league: 'MLB', teams: ['NYY'] }],
  },
  fixtures: {
    [mlbFreeGameRoute()]: { results: [] },
    [espnScoreboardRoute('baseball/mlb')]: {
      events: [{
        id: 'live-mlb',
        date: todayMidLocalISO(),
        status: { type: { id: '2', detail: 'In Progress', shortDetail: 'Bot 5th', description: 'In Progress' } },
        competitions: [{
          date: todayMidLocalISO(),
          status: { type: { id: '2', detail: 'In Progress', shortDetail: 'Bot 5th', description: 'In Progress' } },
          broadcasts: [],
          competitors: [
            { homeAway: 'home', score: '3', team: team(TEAMS.NYY) },
            { homeAway: 'away', score: '1', team: team(TEAMS.RED) },
          ],
        }],
      }],
    },
  },
}
