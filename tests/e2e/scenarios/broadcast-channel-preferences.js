'use strict'

const { espnScoreboardRoute, todayMidLocalISO, team, TEAMS } = require('./_shared')

module.exports = {
  name: 'broadcast-channel-preferences',
  moduleConfig: {
    viewStyle: 'largeLogos',
    showLeagueSeparators: true,
    colored: true,
    hideBroadcasts: false,
    skipChannels: [],
    channelTiers: [
      ['ESPN', 'TNT'],
      ['ESPN Unlmtd'],
    ],
    showUnmatchedChannels: true,
    maxChannels: 1,
    localMarkets: [],
    displayLocalChannels: [],
    sports: [{ league: 'NHL', teams: ['TOR', 'BOS', 'PIT'] }],
  },
  fixtures: {
    [espnScoreboardRoute('hockey/nhl')]: {
      events: [
        {
          id: 'nhl-winning-tier',
          date: todayMidLocalISO(),
          status: { type: { id: '1', detail: 'Scheduled', shortDetail: '7:00 PM', description: 'Scheduled' } },
          competitions: [{
            date: todayMidLocalISO(),
            status: { type: { id: '1', detail: 'Scheduled', shortDetail: '7:00 PM', description: 'Scheduled' } },
            broadcasts: [{ market: 'national', names: ['ESPN', 'TNT', 'ESPN Unlmtd'] }],
            competitors: [
              { homeAway: 'home', score: '0', team: team(TEAMS.TOR) },
              { homeAway: 'away', score: '0', team: team(TEAMS.MTL) },
            ],
          }],
        },
        {
          id: 'nhl-unmatched-fallback',
          date: todayMidLocalISO(),
          status: { type: { id: '1', detail: 'Scheduled', shortDetail: '8:00 PM', description: 'Scheduled' } },
          competitions: [{
            date: todayMidLocalISO(),
            status: { type: { id: '1', detail: 'Scheduled', shortDetail: '8:00 PM', description: 'Scheduled' } },
            broadcasts: [{ market: 'national', names: ['CBSSN', 'Peacock'] }],
            competitors: [
              { homeAway: 'home', score: '0', team: team(TEAMS.BOS) },
              { homeAway: 'away', score: '0', team: team(TEAMS.NYR) },
            ],
          }],
        },
        {
          id: 'nhl-lower-tier',
          date: todayMidLocalISO(),
          status: { type: { id: '1', detail: 'Scheduled', shortDetail: '9:00 PM', description: 'Scheduled' } },
          competitions: [{
            date: todayMidLocalISO(),
            status: { type: { id: '1', detail: 'Scheduled', shortDetail: '9:00 PM', description: 'Scheduled' } },
            broadcasts: [{ market: 'national', names: ['ESPN Unlmtd'] }],
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
