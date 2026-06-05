'use strict'

const { espnScoreboardRoute } = require('./_shared')

module.exports = {
  name: 'state-empty-no-games-today',
  moduleConfig: {
    viewStyle: 'largeLogos',
    sports: [{ league: 'NHL', teams: ['TOR'] }],
  },
  fixtures: {
    [espnScoreboardRoute('hockey/nhl')]: { events: [] },
  },
}
