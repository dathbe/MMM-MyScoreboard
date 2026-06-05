'use strict'

const { espnScoreboardRoute, makeFinalGame, makeScheduledGame, TEAMS } = require('./_shared')

module.exports = {
  name: 'viewstyle-largeLogos',
  moduleConfig: {
    viewStyle: 'largeLogos',
    showLeagueSeparators: true,
    colored: true,
    highlightWinners: true,
    sports: [{ league: 'NHL', teams: ['TOR', 'BOS', 'PIT'] }],
  },
  fixtures: {
    [espnScoreboardRoute('hockey/nhl')]: {
      events: [
        makeFinalGame({ home: TEAMS.TOR, away: TEAMS.MTL, hScore: 4, aScore: 2 }),
        makeFinalGame({ home: TEAMS.BOS, away: TEAMS.NYR, hScore: 3, aScore: 4 }),
        makeScheduledGame({ home: TEAMS.PIT, away: TEAMS.PHL }),
      ],
    },
  },
}
