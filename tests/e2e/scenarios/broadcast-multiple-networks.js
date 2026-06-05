'use strict'

const { espnScoreboardRoute, todayMidLocalISO, team, TEAMS } = require('./_shared')

module.exports = {
  name: 'broadcast-multiple-networks',
  moduleConfig: {
    viewStyle: 'largeLogos',
    showLeagueSeparators: true,
    colored: true,
    hideBroadcasts: false,
    skipChannels: [],
    localMarkets: [],
    displayLocalChannels: [],
    sports: [{ league: 'NHL', teams: ['TOR', 'BOS', 'PIT'] }],
  },
  fixtures: {
    [espnScoreboardRoute('hockey/nhl')]: {
      events: [
        {
          id: 'nhl-espn',
          date: todayMidLocalISO(),
          status: { type: { id: '1', detail: 'Scheduled', shortDetail: '7:00 PM', description: 'Scheduled' } },
          competitions: [{
            date: todayMidLocalISO(),
            status: { type: { id: '1', detail: 'Scheduled', shortDetail: '7:00 PM', description: 'Scheduled' } },
            broadcasts: [{ market: 'national', names: ['ESPN'] }],
            competitors: [
              { homeAway: 'home', score: '0', team: team(TEAMS.TOR) },
              { homeAway: 'away', score: '0', team: team(TEAMS.MTL) },
            ],
          }],
        },
        {
          id: 'nhl-tnt',
          date: todayMidLocalISO(),
          status: { type: { id: '1', detail: 'Scheduled', shortDetail: '8:00 PM', description: 'Scheduled' } },
          competitions: [{
            date: todayMidLocalISO(),
            status: { type: { id: '1', detail: 'Scheduled', shortDetail: '8:00 PM', description: 'Scheduled' } },
            broadcasts: [{ market: 'national', names: ['TNT'] }],
            competitors: [
              { homeAway: 'home', score: '0', team: team(TEAMS.BOS) },
              { homeAway: 'away', score: '0', team: team(TEAMS.NYR) },
            ],
          }],
        },
        {
          id: 'nhl-tbs',
          date: todayMidLocalISO(),
          status: { type: { id: '1', detail: 'Scheduled', shortDetail: '10:00 PM', description: 'Scheduled' } },
          competitions: [{
            date: todayMidLocalISO(),
            status: { type: { id: '1', detail: 'Scheduled', shortDetail: '10:00 PM', description: 'Scheduled' } },
            broadcasts: [{ market: 'national', names: ['TBS'] }],
            competitors: [
              { homeAway: 'home', score: '0', team: team(TEAMS.PIT) },
              { homeAway: 'away', score: '0', team: team(TEAMS.PHL) },
            ],
          }],
        },
      ],
    },
  },
}
