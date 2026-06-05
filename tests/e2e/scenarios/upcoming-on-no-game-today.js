'use strict'

const {
  espnScoreboardRoute, espnTeamScheduleRoute, team, TEAMS,
} = require('./_shared')

const moment = require('moment-timezone')

function futureGameDate(daysAhead = 2) {
  return moment().add(daysAhead, 'days').hour(19).minute(0).second(0).toISOString()
}

module.exports = {
  name: 'upcoming-on-no-game-today',
  moduleConfig: {
    viewStyle: 'largeLogos',
    showLeagueSeparators: true,
    colored: true,
    showUpcomingGames: true,
    alwaysShowToday: true,
    sports: [{ league: 'NHL', teams: ['TOR'] }],
  },
  fixtures: {
    [espnScoreboardRoute('hockey/nhl')]: { events: [] },
    [espnTeamScheduleRoute('hockey/nhl', 'TOR')]: {
      events: [{
        id: 'next-tor-2',
        date: futureGameDate(3),
        competitions: [{
          date: futureGameDate(3),
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
