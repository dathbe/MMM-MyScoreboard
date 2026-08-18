/*

  ---------------------------------------------
    Provider for Live Tennis API Scoreboard Data
  ---------------------------------------------

  Provides live and upcoming singles/doubles scores for
    ATP, WTA (and, via the TENNIS league code, all tours)

  Vendor note: this provider is written by the operator of the Live Tennis
  API (https://livetennisapi.com). A free key is self-serve at
  https://livetennisapi.com/subscribe/free (30 requests/minute, 100/day).
  The free tier serves LIVE and UPCOMING matches; completed results are part
  of the paid History product, so this provider shows today's live and
  upcoming matches only.

*/

const Log = require('logger')
const moment = require('moment-timezone')

const BASE_URL = 'https://api.livetennisapi.com/api/public/v1'

module.exports = {
  PROVIDER_NAME: 'LiveTennisAPI',

  /*
    Free tier is 30 req/min and 100 req/day. Each poll spends two calls
    (live + upcoming) regardless of how many tennis leagues are configured,
    because one shared cache feeds them all. A 15-minute cadence is ~96
    calls/day, which stays inside the free 100/day. Do not lower this on a
    free key; sustained fast polling needs a paid tier.
  */
  POLL_FREQUENCY: 15 * 60 * 1000,

  apiKey: null,
  matches: null,
  dataOk: false,
  dataPollStarted: false,

  getScores(payload, gameDate, callback) {
    if (payload.apiKey && !this.apiKey) this.apiKey = payload.apiKey

    if (!this.apiKey) {
      Log.error('[MMM-MyScoreboard] LiveTennisAPI: no API key set. Add `liveTennisApiKey` to your module config. Free key: https://livetennisapi.com/subscribe/free')
      callback([], payload.index, false)
      return
    }

    if (!this.dataPollStarted) this.startDataPoll()

    const self = this
    let waited = 0
    const waitForData = setInterval(function () {
      if (self.matches != null) {
        clearInterval(waitForData)
        const result = self.formatScores(payload.league, payload.teams, gameDate)
        callback(result.games, payload.index, result.noGamesToday)
      }
      else if ((waited += 500) >= 10000) {
        clearInterval(waitForData)
        callback([], payload.index, false)
      }
    }, 500)
  },

  startDataPoll() {
    this.dataPollStarted = true
    this.getData()
    setInterval(() => this.getData(), this.POLL_FREQUENCY)
  },

  async fetchMatches(status) {
    const res = await fetch(`${BASE_URL}/matches?status=${status}&limit=200`, {
      headers: { 'X-API-Key': this.apiKey },
    })
    if (!res.ok) {
      throw new Error(`HTTP ${res.status} - ${res.statusText} (status=${status})`)
    }
    const body = await res.json()
    return (body && Array.isArray(body.data)) ? body.data : []
  },

  async getData() {
    try {
      // `live` and `upcoming` are the FREE current-state picture; `completed`
      // is a paid surface, so it is intentionally not requested here.
      const [live, upcoming] = await Promise.all([
        this.fetchMatches('live'),
        this.fetchMatches('upcoming'),
      ])
      this.matches = live.concat(upcoming)
      this.dataOk = true
      Log.info(`[MMM-MyScoreboard] LiveTennisAPI matches fetched (${live.length} live, ${upcoming.length} upcoming)`)
    }
    catch (err) {
      Log.error(`[MMM-MyScoreboard] Error fetching LiveTennisAPI matches: ${err}`)
      this.dataOk = false
      // Unblock any waiters; a transient failure must not mark the day as
      // having no games (that would suppress requests for the rest of the day).
      if (this.matches == null) this.matches = []
    }
  },

  leagueToTour(league) {
    switch (league) {
      case 'ATP': return 'atp'
      case 'WTA': return 'wta'
      default: return null // TENNIS (or anything else) = all tours
    }
  },

  formatScores(league, teams, gameDate) {
    const tour = this.leagueToTour(league)
    const day = moment(gameDate).format('YYYY-MM-DD')
    const today = moment().format('YYYY-MM-DD')
    const games = []

    for (let i = 0; i < this.matches.length; i++) {
      const m = this.matches[i]
      if (tour != null && m.tour !== tour) continue

      let include
      if (m.status === 'live') {
        // A live match is happening now, so it belongs on today's board only.
        include = (day === today)
      }
      else {
        // upcoming / completed / cancelled: match on the scheduled local date.
        const when = m.scheduled_time
        if (when) {
          include = moment.utc(when).local().format('YYYY-MM-DD') === day
        }
        else {
          include = (m.status === 'upcoming' && day === today)
        }
      }
      if (!include) continue

      if (teams != null && teams.length > 0 && !this.matchHasTeam(m, teams)) continue

      games.push(this.formatGame(m))
    }

    return { games: games, noGamesToday: games.length === 0 && this.dataOk }
  },

  matchHasTeam(m, teams) {
    const players = m.players || {}
    const names = [players.p1 && players.p1.name, players.p2 && players.p2.name]
      .filter(Boolean)
      .map(n => n.toLowerCase())
    return teams.some((t) => {
      const needle = String(t).toLowerCase()
      return names.some(n => n.includes(needle))
    })
  },

  formatGame(m) {
    const players = m.players || {}
    const p1 = players.p1 || {}
    const p2 = players.p2 || {}
    const score = m.score || {}
    const sets = Array.isArray(score.sets) ? score.sets : []

    let gameMode
    if (m.status === 'live') gameMode = 1
    else if (m.status === 'completed') gameMode = 2
    else gameMode = 0 // upcoming / cancelled render as "future" (no score shown)

    const server = (score.server === 1 || score.server === 2) ? score.server : null
    const serveP1 = (gameMode === 1 && server === 1) ? ' •' : ''
    const serveP2 = (gameMode === 1 && server === 2) ? ' •' : ''

    return {
      classes: [],
      gameMode: gameMode,
      hTeam: this.surname(p1.name) + serveP1,
      vTeam: this.surname(p2.name) + serveP2,
      hTeamLong: (p1.name || 'TBD') + serveP1,
      vTeamLong: (p2.name || 'TBD') + serveP2,
      hTeamLogoUrl: '',
      vTeamLogoUrl: '',
      hScore: gameMode === 0 ? '' : (sets.length > 0 ? sets[0] : 0),
      vScore: gameMode === 0 ? '' : (sets.length > 1 ? sets[1] : 0),
      status: this.buildStatus(m, score),
    }
  },

  buildStatus(m, score) {
    const lines = []
    const setStr = this.setScoreString(score)

    if (m.status === 'upcoming' || m.status === 'cancelled') {
      if (m.event_status) lines.push(m.event_status)
      else lines.push(m.scheduled_time ? this.formatTime(m.scheduled_time) : 'TBD')
      if (m.round) lines.push(m.round)
      return lines
    }

    if (m.status === 'completed') {
      lines.push(m.event_status ? m.event_status : 'Final')
      if (setStr) lines.push(setStr)
      return lines
    }

    // live
    if (setStr) lines.push(setStr)
    const cur = this.currentGameString(score)
    if (cur) lines.push(cur)
    if (this.isBreakPoint(score)) lines.push('BP')
    if (m.event_status === 'Interrupted') lines.push('Interrupted')
    return lines
  },

  setScoreString(score) {
    const g = score.games
    if (!Array.isArray(g) || g.length < 2 || !Array.isArray(g[0]) || !Array.isArray(g[1])) {
      return ''
    }
    const n = Math.max(g[0].length, g[1].length)
    const parts = []
    for (let i = 0; i < n; i++) {
      const a = g[0][i] != null ? g[0][i] : 0
      const b = g[1][i] != null ? g[1][i] : 0
      parts.push(`${a}-${b}`)
    }
    return parts.join(' ')
  },

  currentGameString(score) {
    const p = score.points
    if (!Array.isArray(p) || p.length < 2) return ''
    if (p[0] == null || p[1] == null) return ''
    return score.is_tiebreak ? `TB ${p[0]}-${p[1]}` : `${p[0]}-${p[1]}`
  },

  /*
    Break point: the receiver is one point from winning the game.
    True when the receiver is at AD, or at 40 while the server is at 0/15/30.
    Never in a tiebreak, and never when server or points are unknown.
  */
  isBreakPoint(score) {
    if (score.is_tiebreak) return false
    const server = score.server
    if (server !== 1 && server !== 2) return false
    const p = score.points
    if (!Array.isArray(p) || p.length < 2) return false
    const serverPts = p[server - 1]
    const receiverPts = p[server === 1 ? 1 : 0]
    if (serverPts == null || receiverPts == null) return false
    if (receiverPts === 'AD') return true
    if (receiverPts === '40' && (serverPts === '0' || serverPts === '15' || serverPts === '30')) return true
    return false
  },

  formatTime(iso) {
    let timeFormat = 'h:mm a'
    if (typeof config !== 'undefined' && config.timeFormat === 24) {
      timeFormat = 'H:mm'
    }
    return moment.utc(iso).local().format(timeFormat)
  },

  surname(name) {
    if (!name) return 'TBD'
    if (name.indexOf('/') > -1) {
      // doubles team: keep each player's surname
      return name.split('/').map(part => this.lastToken(part.trim())).join('/')
    }
    return this.lastToken(name)
  },

  lastToken(s) {
    const parts = String(s).trim().split(/\s+/)
    return parts[parts.length - 1] || s
  },
}
