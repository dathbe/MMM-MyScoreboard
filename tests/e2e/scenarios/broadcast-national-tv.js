'use strict'

const { espnScoreboardRoute, todayMidLocalISO, team, TEAMS } = require('./_shared')

module.exports = {
  name: 'broadcast-national-tv',
  moduleConfig: {
    viewStyle: 'largeLogos',
    showLeagueSeparators: true,
    colored: true,
    hideBroadcasts: false,
    skipChannels: [],
    localMarkets: [],
    displayLocalChannels: [],
    sports: [{ league: 'NFL', teams: ['DAL'] }],
  },
  fixtures: {
    [espnScoreboardRoute('football/nfl')]: {
      events: [{
        id: 'sched-nfl-broadcast',
        date: todayMidLocalISO(),
        status: { type: { id: '1', detail: 'Scheduled', shortDetail: '8:20 PM', description: 'Scheduled' } },
        competitions: [{
          date: todayMidLocalISO(),
          status: { type: { id: '1', detail: 'Scheduled', shortDetail: '8:20 PM', description: 'Scheduled' } },
          broadcasts: [
            { market: 'national', names: ['NBC'] },
          ],
          competitors: [
            { homeAway: 'home', score: '0', team: team(TEAMS.DAL) },
            { homeAway: 'away', score: '0', team: team(TEAMS.PHL) },
          ],
        }],
      }],
    },
  },
}
