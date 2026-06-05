'use strict'

const { espnScoreboardRoute, mlbFreeGameRoute, todayMidLocalISO, team, TEAMS } = require('./_shared')

module.exports = {
  name: 'broadcast-showLocalBroadcasts-on',
  moduleConfig: {
    viewStyle: 'largeLogos',
    showLeagueSeparators: true,
    colored: true,
    hideBroadcasts: false,
    showLocalBroadcasts: true,
    skipChannels: [],
    localMarkets: ['NYY'],
    displayLocalChannels: [],
    sports: [{ league: 'MLB', teams: ['NYY'] }],
  },
  fixtures: {
    [mlbFreeGameRoute()]: { results: [] },
    [espnScoreboardRoute('baseball/mlb')]: {
      events: [{
        id: 'mlb-local-broadcast',
        date: todayMidLocalISO(),
        status: { type: { id: '1', detail: 'Scheduled', shortDetail: '7:05 PM', description: 'Scheduled' } },
        competitions: [{
          date: todayMidLocalISO(),
          status: { type: { id: '1', detail: 'Scheduled', shortDetail: '7:05 PM', description: 'Scheduled' } },
          broadcasts: [
            { market: 'home', names: ['YES'] },
            { market: 'away', names: ['NESN'] },
            { market: 'national', names: ['MLBN'] },
          ],
          competitors: [
            { homeAway: 'home', score: '0', team: team(TEAMS.NYY) },
            { homeAway: 'away', score: '0', team: team(TEAMS.RED) },
          ],
        }],
      }],
    },
  },
}
