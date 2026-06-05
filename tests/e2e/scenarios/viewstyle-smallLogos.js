'use strict'

const { espnScoreboardRoute, makeFinalGame, TEAMS } = require('./_shared')

module.exports = {
  name: 'viewstyle-smallLogos',
  moduleConfig: {
    viewStyle: 'smallLogos',
    showLeagueSeparators: true,
    colored: true,
    sports: [{ league: 'NHL', teams: ['TOR', 'BOS'] }],
  },
  fixtures: {
    [espnScoreboardRoute('hockey/nhl')]: {
      events: [
        makeFinalGame({ home: TEAMS.TOR, away: TEAMS.MTL, hScore: 4, aScore: 2 }),
        makeFinalGame({ home: TEAMS.BOS, away: TEAMS.NYR, hScore: 3, aScore: 4 }),
      ],
    },
  },
}
