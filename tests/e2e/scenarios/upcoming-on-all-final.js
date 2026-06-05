'use strict'

const {
  espnScoreboardRoute, espnTeamScheduleRoute, makeFinalGame,
  team, TEAMS,
} = require('./_shared')

const moment = require('moment-timezone')

function futureGameDate(daysAhead = 2) {
  return moment().add(daysAhead, 'days').hour(19).minute(0).second(0).toISOString()
}

module.exports = {
  name: 'upcoming-on-all-final',
  moduleConfig: {
    viewStyle: 'largeLogos',
    showLeagueSeparators: true,
    colored: true,
    highlightWinners: true,
    showUpcomingGames: true,
    alwaysShowToday: true, // bypass rollover gate for deterministic rendering
    sports: [{ league: 'NHL', teams: ['TOR'] }],
  },
  fixtures: {
    [espnScoreboardRoute('hockey/nhl')]: {
      events: [
        makeFinalGame({ home: TEAMS.TOR, away: TEAMS.MTL, hScore: 4, aScore: 2 }),
      ],
    },
    [espnTeamScheduleRoute('hockey/nhl', 'TOR')]: {
      events: [{
        id: 'next-tor',
        date: futureGameDate(2),
        competitions: [{
          date: futureGameDate(2),
          status: { type: { id: '1', completed: false } },
          competitors: [
            { homeAway: 'home', team: team(TEAMS.TOR) },
            { homeAway: 'away', team: team(TEAMS.BOS) },
          ],
        }],
      }],
    },
  },
}
