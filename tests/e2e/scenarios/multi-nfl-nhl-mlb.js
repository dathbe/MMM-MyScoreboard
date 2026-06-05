'use strict'

const {
  espnScoreboardRoute, mlbFreeGameRoute, makeFinalGame, makeInProgressGame, TEAMS,
} = require('./_shared')

module.exports = {
  name: 'multi-nfl-nhl-mlb',
  moduleConfig: {
    viewStyle: 'largeLogos',
    showLeagueSeparators: true,
    colored: true,
    highlightWinners: true,
    sports: [
      { league: 'NFL', teams: ['DAL'] },
      { league: 'NHL', teams: ['TOR'] },
      { league: 'MLB', teams: ['NYY'] },
    ],
  },
  fixtures: {
    [espnScoreboardRoute('football/nfl')]: {
      events: [
        makeFinalGame({ home: TEAMS.DAL, away: TEAMS.PHL, hScore: 24, aScore: 17 }),
      ],
    },
    [espnScoreboardRoute('hockey/nhl')]: {
      events: [
        makeFinalGame({ home: TEAMS.TOR, away: TEAMS.MTL, hScore: 4, aScore: 2 }),
      ],
    },
    [mlbFreeGameRoute()]: { results: [] },
    [espnScoreboardRoute('baseball/mlb')]: {
      events: [
        makeInProgressGame({ home: TEAMS.NYY, away: TEAMS.RED, hScore: 3, aScore: 1, short: 'Bot 5th' }),
      ],
    },
  },
}
