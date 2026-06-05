'use strict'

const { espnScoreboardRoute, todayMidLocalISO, team } = require('./_shared')

const OSU = { abbr: 'OSU', name: 'Buckeyes', short: 'Buckeyes', location: 'Ohio State' }
const MICH = { abbr: 'MICH', name: 'Wolverines', short: 'Wolverines', location: 'Michigan' }

module.exports = {
  name: 'ncaa-rankings-on',
  moduleConfig: {
    viewStyle: 'largeLogos',
    showLeagueSeparators: true,
    colored: true,
    showRankings: true,
    sports: [{ league: 'NCAAF', teams: ['OSU', 'MICH'] }],
  },
  fixtures: {
    [espnScoreboardRoute('football/college-football') + '&groups=80']: {
      events: [{
        id: 'ncaaf-1',
        date: todayMidLocalISO(),
        status: { type: { id: '3', detail: 'Final', shortDetail: 'Final', description: 'Final' } },
        competitions: [{
          date: todayMidLocalISO(),
          status: { type: { id: '3', detail: 'Final', shortDetail: 'Final', description: 'Final' } },
          broadcasts: [],
          competitors: [
            { homeAway: 'home', score: '30', team: team(OSU), curatedRank: { current: 1 } },
            { homeAway: 'away', score: '24', team: team(MICH), curatedRank: { current: 5 } },
          ],
        }],
      }],
    },
  },
}
