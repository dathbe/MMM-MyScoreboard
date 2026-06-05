'use strict'

const { espnScoreboardRoute, makeFinalGame, TEAMS } = require('./_shared')

module.exports = {
  name: 'flag-shadeRows-on',
  moduleConfig: {
    viewStyle: 'largeLogos',
    showLeagueSeparators: true,
    colored: true,
    shadeRows: true,
    sports: [{ league: 'NHL', teams: ['TOR', 'BOS', 'PIT'] }],
  },
  fixtures: {
    [espnScoreboardRoute('hockey/nhl')]: {
      events: [
        makeFinalGame({ home: TEAMS.TOR, away: TEAMS.MTL, hScore: 4, aScore: 2 }),
        makeFinalGame({ home: TEAMS.BOS, away: TEAMS.NYR, hScore: 3, aScore: 4 }),
        makeFinalGame({ home: TEAMS.PIT, away: TEAMS.PHL, hScore: 2, aScore: 5 }),
      ],
    },
  },
}
