'use strict'

const { espnScoreboardRoute, makeFinalGame, TEAMS } = require('./_shared')

module.exports = {
  name: 'flag-colored-off',
  moduleConfig: {
    viewStyle: 'largeLogos',
    showLeagueSeparators: true,
    colored: false,
    sports: [{ league: 'NHL', teams: ['TOR'] }],
  },
  fixtures: {
    [espnScoreboardRoute('hockey/nhl')]: {
      events: [
        makeFinalGame({ home: TEAMS.TOR, away: TEAMS.MTL, hScore: 4, aScore: 2 }),
      ],
    },
  },
}
