'use strict'

const { espnScoreboardRoute, todayMidLocalISO, team, TEAMS } = require('./_shared')

module.exports = {
  name: 'broadcast-hideBroadcasts-on',
  moduleConfig: {
    viewStyle: 'largeLogos',
    showLeagueSeparators: true,
    colored: true,
    hideBroadcasts: true,
    sports: [{ league: 'NHL', teams: ['TOR'] }],
  },
  fixtures: {
    [espnScoreboardRoute('hockey/nhl')]: {
      events: [{
        id: 'sched-with-broadcasts',
        date: todayMidLocalISO(),
        status: { type: { id: '1', detail: 'Scheduled', shortDetail: '7:00 PM', description: 'Scheduled' } },
        competitions: [{
          date: todayMidLocalISO(),
          status: { type: { id: '1', detail: 'Scheduled', shortDetail: '7:00 PM', description: 'Scheduled' } },
          broadcasts: [{
            market: 'national',
            names: ['ESPN'],
          }],
          competitors: [
            { homeAway: 'home', score: '0', team: team(TEAMS.TOR) },
            { homeAway: 'away', score: '0', team: team(TEAMS.MTL) },
          ],
        }],
      }],
    },
  },
}
