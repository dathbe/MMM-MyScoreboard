'use strict'

const { espnScoreboardRoute, todayMidLocalISO, team, TEAMS } = require('./_shared')

module.exports = {
  name: 'state-nhl-overtime-final',
  moduleConfig: {
    viewStyle: 'largeLogos',
    showLeagueSeparators: true,
    colored: true,
    highlightWinners: true,
    sports: [{ league: 'NHL', teams: ['TOR'] }],
  },
  fixtures: {
    [espnScoreboardRoute('hockey/nhl')]: {
      events: [{
        id: 'ot1',
        date: todayMidLocalISO(),
        status: { type: { id: '3', detail: 'Final/OT', shortDetail: 'Final/OT', description: 'Final' } },
        competitions: [{
          date: todayMidLocalISO(),
          status: { type: { id: '3', detail: 'Final/OT', shortDetail: 'Final/OT', description: 'Final' } },
          broadcasts: [],
          competitors: [
            { homeAway: 'home', score: '4', team: team(TEAMS.TOR) },
            { homeAway: 'away', score: '3', team: team(TEAMS.MTL) },
          ],
        }],
      }],
    },
  },
}
