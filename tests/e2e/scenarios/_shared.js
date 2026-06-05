'use strict'

/*
  Shared helpers for scenario route construction + dynamic fixture building.

  Fixtures must use *today's* date in the local timezone so the module's
  per-date filter accepts them. Helpers here generate fresh JSON each test
  run with today's wall-clock date stamps.
*/

const moment = require('moment-timezone')

function todayYMD() {
  return moment().format('YYYYMMDD')
}

function todayDashed() {
  return moment().format('YYYY-MM-DD')
}

function todayMidLocalISO() {
  // Noon local today — a safe "in-progress / final" time stamp.
  return moment().startOf('day').add(15, 'hours').toISOString()
}

function espnScoreboardRoute(leaguePath) {
  return `GET /apis/site/v2/sports/${leaguePath}/scoreboard?dates=${todayYMD()}&limit=200`
}

function espnTeamScheduleRoute(leaguePath, teamAbbr) {
  return `GET /apis/site/v2/sports/${leaguePath}/teams/${teamAbbr}/schedule`
}

function mlbFreeGameRoute() {
  return `GET /api/epg/v3/search?date=${todayDashed()}&exp=MLB`
}

function team(opts) {
  return {
    abbreviation: opts.abbr,
    name: opts.name,
    shortDisplayName: opts.short ?? opts.name,
    displayName: opts.display ?? opts.name,
    location: opts.location ?? opts.name,
    logo: opts.logo ?? '',
  }
}

function makeFinalGame(opts) {
  const date = opts.date ?? todayMidLocalISO()
  return {
    id: opts.id ?? `final-${opts.home.abbr}-${opts.away.abbr}`,
    date,
    status: { type: { id: '3', detail: 'Final', shortDetail: 'Final', description: 'Final' } },
    competitions: [{
      date,
      status: { type: { id: '3', detail: 'Final', shortDetail: 'Final', description: 'Final' } },
      broadcasts: [],
      competitors: [
        { homeAway: 'home', score: String(opts.hScore), team: team(opts.home) },
        { homeAway: 'away', score: String(opts.aScore), team: team(opts.away) },
      ],
    }],
  }
}

function makeScheduledGame(opts) {
  const date = opts.date ?? todayMidLocalISO()
  return {
    id: opts.id ?? `sched-${opts.home.abbr}-${opts.away.abbr}`,
    date,
    status: { type: { id: '1', detail: 'Scheduled', shortDetail: '7:00 PM', description: 'Scheduled' } },
    competitions: [{
      date,
      status: { type: { id: '1', detail: 'Scheduled', shortDetail: '7:00 PM', description: 'Scheduled' } },
      broadcasts: [],
      competitors: [
        { homeAway: 'home', score: '0', team: team(opts.home) },
        { homeAway: 'away', score: '0', team: team(opts.away) },
      ],
    }],
  }
}

function makeInProgressGame(opts) {
  const date = opts.date ?? todayMidLocalISO()
  const statusId = opts.statusId ?? '2'
  return {
    id: opts.id ?? `live-${opts.home.abbr}-${opts.away.abbr}`,
    date,
    status: { type: { id: statusId, detail: 'In Progress', shortDetail: opts.short ?? '2nd 12:34', description: 'In Progress' } },
    competitions: [{
      date,
      status: { type: { id: statusId, detail: 'In Progress', shortDetail: opts.short ?? '2nd 12:34', description: 'In Progress' } },
      broadcasts: [],
      competitors: [
        { homeAway: 'home', score: String(opts.hScore), team: team(opts.home) },
        { homeAway: 'away', score: String(opts.aScore), team: team(opts.away) },
      ],
    }],
  }
}

// Sample teams used across scenarios
const TEAMS = {
  TOR: { abbr: 'TOR', name: 'Maple Leafs', short: 'Leafs', location: 'Toronto' },
  MTL: { abbr: 'MTL', name: 'Canadiens', short: 'Habs', location: 'Montreal' },
  BOS: { abbr: 'BOS', name: 'Bruins', short: 'Bruins', location: 'Boston' },
  NYR: { abbr: 'NYR', name: 'Rangers', short: 'Rangers', location: 'New York' },
  PIT: { abbr: 'PIT', name: 'Penguins', short: 'Penguins', location: 'Pittsburgh' },
  PHI: { abbr: 'PHI', name: 'Flyers', short: 'Flyers', location: 'Philadelphia' },
  // MLB
  NYY: { abbr: 'NYY', name: 'Yankees', short: 'Yankees', location: 'New York' },
  RED: { abbr: 'BOS', name: 'Red Sox', short: 'Red Sox', location: 'Boston' },
  // NFL
  DAL: { abbr: 'DAL', name: 'Cowboys', short: 'Cowboys', location: 'Dallas' },
  PHL: { abbr: 'PHI', name: 'Eagles', short: 'Eagles', location: 'Philadelphia' },
}

module.exports = {
  todayYMD, todayDashed, todayMidLocalISO,
  espnScoreboardRoute, espnTeamScheduleRoute, mlbFreeGameRoute,
  team, makeFinalGame, makeScheduledGame, makeInProgressGame, TEAMS,
}
