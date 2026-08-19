/*

  -------------------------------------
    Provider for Live Tennis API Data
  -------------------------------------

  Provides scores for
    ATP (men's singles) and WTA (women's singles)

  Data comes from the Live Tennis API (https://livetennisapi.com).
  Disclosure: this provider was contributed by the Live Tennis API team.

  The API key is read from the LIVETENNIS_API_KEY environment variable and is
  only ever used here, in the node helper. It is never sent to the browser.

  Free tier is 30 requests/minute and 100 requests/day. This provider keeps a
  single shared cache and refreshes it on a timer (see POLL_FREQUENCY below),
  so the number of API calls does not grow with the number of configured
  leagues or the module's refresh rate. Each refresh spends 3 requests per tour
  (live + upcoming + completed). See the README for how the default cadence
  relates to the free 100/day cap and how to stay within it.

*/

const Log = require('logger')
const moment = require('moment-timezone')

const API_BASE = 'https://api.livetennisapi.com/api/public/v1'
const RESULT_LIMIT = 50

// Refresh cadence in minutes. Free-tier users can raise this with the
// LIVETENNIS_POLL_INTERVAL environment variable to fit inside the 100/day cap.
const DEFAULT_POLL_MINUTES = 15
const POLL_MINUTES = (function () {
  const raw = Number.parseInt(process.env.LIVETENNIS_POLL_INTERVAL, 10)
  return Number.isFinite(raw) && raw > 0 ? raw : DEFAULT_POLL_MINUTES
})()

// MMM-MyScoreboard league code -> Live Tennis API tour value. The API's tour
// enum is lowercase and rejects unknown / upper-case values with a 400.
const TOUR_BY_LEAGUE = {
  ATP: 'atp',
  WTA: 'wta',
}

module.exports = {
  PROVIDER_NAME: 'LiveTennisAPI',
  POLL_FREQUENCY: POLL_MINUTES * 60 * 1000,
  scores: {}, // tour -> array of normalized game objects
  tours: null, // Set of tours that have actually been requested
  pollStarted: false,
  keyWarningLogged: false,

  getScores(payload, gameDate, callback) {
    const tour = TOUR_BY_LEAGUE[payload.league]
    if (!tour) {
      callback([], payload.index, false)
      return
    }

    this.registerTour(tour)
    if (!this.pollStarted) this.startDataPoll()

    const waitForData = setInterval(() => {
      if (this.scores[tour]) {
        clearInterval(waitForData)
        callback(this.getGames(tour, payload.teams, gameDate), payload.index, false)
      }
    }, 500)

    // Timeout after 10 seconds
    setTimeout(() => clearInterval(waitForData), 10000)
  },

  registerTour(tour) {
    if (!this.tours) this.tours = new Set()
    this.tours.add(tour)
  },

  startDataPoll() {
    this.pollStarted = true
    this.getData()
    setInterval(() => this.getData(), this.POLL_FREQUENCY)
  },

  apiKey() {
    const key = process.env.LIVETENNIS_API_KEY
    return key && String(key).trim() ? String(key).trim() : null
  },

  async getData() {
    const key = this.apiKey()
    if (!key) {
      if (!this.keyWarningLogged) {
        Log.error('[MMM-MyScoreboard] LiveTennisAPI: no API key found. Set the LIVETENNIS_API_KEY environment variable. Get a free key at https://livetennisapi.com/subscribe/free')
        this.keyWarningLogged = true
      }
      // Resolve any waiters with an empty slate rather than letting them hang.
      if (this.tours) {
        this.tours.forEach((tour) => {
          if (!this.scores[tour]) this.scores[tour] = []
        })
      }
      return
    }

    if (!this.tours) return
    for (const tour of this.tours) {
      await this.getTour(key, tour)
    }
  },

  async getTour(key, tour) {
    try {
      const [live, upcoming, completed] = await Promise.all([
        this.fetchMatches(key, 'live', tour),
        this.fetchMatches(key, 'upcoming', tour),
        this.fetchMatches(key, 'completed', tour),
      ])

      const games = [...live, ...upcoming, ...completed]
        .map(match => this.normalizeMatch(match))
        .filter(game => game != null)

      this.scores[tour] = games
      Log.info(`[MMM-MyScoreboard] LiveTennisAPI ${tour.toUpperCase()} matches fetched successfully (${games.length} matches)`)
    }
    catch (err) {
      Log.error(`[MMM-MyScoreboard] Error fetching LiveTennisAPI ${tour} matches: ${err}`)
      // Keep any data we already had; only seed an empty slate on first failure.
      if (!this.scores[tour]) this.scores[tour] = []
    }
  },

  buildUrl(status, tour) {
    return `${API_BASE}/matches?status=${status}&tour=${tour}&limit=${RESULT_LIMIT}`
  },

  async fetchMatches(key, status, tour) {
    const res = await fetch(this.buildUrl(status, tour), {
      headers: {
        // The one and only place the credential is used; it stays server-side.
        Authorization: `Bearer ${key}`,
        Accept: 'application/json',
      },
    })
    if (!res.ok) {
      throw new Error(`HTTP ${res.status} - ${res.statusText} (${status})`)
    }
    const body = await res.json()
    return this.extractList(body)
  },

  // Pull the match array out of the response, tolerating the common envelopes.
  extractList(body) {
    if (Array.isArray(body)) return body
    if (!body || typeof body !== 'object') return []
    for (const key of ['data', 'matches', 'results', 'items']) {
      if (Array.isArray(body[key])) return body[key]
    }
    return []
  },

  // Convert one raw API match into the module's game object. Player 1 maps to
  // the home slot and player 2 to the visitor slot (leagues set homeTeamFirst
  // so this renders as "P1 vs P2"). Malformed entries are skipped, not thrown.
  normalizeMatch(match) {
    if (!match || typeof match !== 'object') return null

    const players = this.players(match)
    if (players.length < 2) return null
    const p1 = players[0]
    const p2 = players[1]
    if (!p1.name || !p2.name) return null

    const status = String(match.status || '').toLowerCase()
    var gameMode = 0 // FUTURE
    if (status === 'live' || status === 'in_progress' || status === 'inprogress' || status === 'playing') {
      gameMode = 1 // IN_PROGRESS
    }
    else if (status === 'completed' || status === 'finished' || status === 'final' || status === 'complete') {
      gameMode = 2 // FINAL
    }

    const startTime = match.start_time ?? match.startTime ?? match.scheduled ?? null

    return {
      classes: [],
      gameMode: gameMode,
      hTeam: this.surname(p1.name),
      vTeam: this.surname(p2.name),
      hTeamLong: p1.name,
      vTeamLong: p2.name,
      hTeamLogoUrl: '',
      vTeamLogoUrl: '',
      hScore: this.setsWon(p1.sets, p2.sets),
      vScore: this.setsWon(p2.sets, p1.sets),
      status: this.statusLines(gameMode, p1, p2, startTime),
      startTime: startTime,
    }
  },

  // Normalize the two competitors, tolerating list or flat home/away shapes.
  players(match) {
    var source = match.players ?? match.competitors ?? match.participants
    if (!Array.isArray(source)) {
      source = [match.home ?? match.player1, match.away ?? match.player2].filter(Boolean)
    }

    return source
      .filter(entry => entry && typeof entry === 'object')
      .map(entry => ({
        name: this.pickString(entry.name, entry.full_name, entry.player_name, entry.short_name),
        serving: Boolean(entry.serving ?? entry.is_serving ?? entry.isServing),
        sets: this.setGames(entry),
        points: entry.points ?? entry.point ?? entry.game_score ?? null,
      }))
  },

  // A player's per-set game counts, as an array of values.
  setGames(entry) {
    const sets = entry.sets ?? entry.set_scores ?? entry.setScores ?? entry.scores
    if (!Array.isArray(sets)) return []
    return sets.map((value) => {
      if (value && typeof value === 'object') {
        return value.games ?? value.score ?? value.value ?? null
      }
      return value
    })
  },

  // Count the sets a player has actually won. A set counts as decided when its
  // leader has reached at least six games, which keeps an in-progress set (e.g.
  // 2-1) and a running tiebreak (6-6) out of the total.
  setsWon(mySets, oppSets) {
    if (!Array.isArray(mySets) || !Array.isArray(oppSets)) return 0
    var won = 0
    for (let i = 0; i < mySets.length; i++) {
      const mine = Number(mySets[i])
      const opp = Number(oppSets[i])
      if (!Number.isFinite(mine) || !Number.isFinite(opp)) continue
      if (mine > opp && Math.max(mine, opp) >= 6) won++
    }
    return won
  },

  // Build the status line(s) shown next to the score. The renderer prints each
  // entry stacked, so this needs no renderer changes.
  statusLines(gameMode, p1, p2, startTime) {
    const setString = this.setString(p1.sets, p2.sets)

    if (gameMode === 2) { // FINAL
      return setString ? ['Final', setString] : ['Final']
    }

    if (gameMode === 1) { // IN_PROGRESS
      const parts = []
      if (setString) parts.push(setString)
      const points = this.pointString(p1, p2)
      if (points) parts.push(points)
      const server = p1.serving ? this.surname(p1.name) : (p2.serving ? this.surname(p2.name) : '')
      if (server) parts.push(`Serving: ${server}`)
      return parts.length > 0 ? parts : ['Live']
    }

    // FUTURE
    const time = this.formatTime(startTime)
    return time ? [time] : ['Upcoming']
  },

  // Per-set games as "6-4 3-6 2-1", limited to sets that have started.
  setString(p1Sets, p2Sets) {
    if (!Array.isArray(p1Sets) || !Array.isArray(p2Sets)) return ''
    const count = Math.max(p1Sets.length, p2Sets.length)
    const parts = []
    for (let i = 0; i < count; i++) {
      const a = p1Sets[i]
      const b = p2Sets[i]
      if ((a == null || a === '') && (b == null || b === '')) continue
      parts.push(`${a == null ? 0 : a}-${b == null ? 0 : b}`)
    }
    return parts.join(' ')
  },

  // Current-game points as "40-30" / "AD-40" when the API reports them.
  pointString(p1, p2) {
    if ((p1.points == null || p1.points === '') && (p2.points == null || p2.points === '')) return ''
    return `${p1.points == null ? '' : p1.points}-${p2.points == null ? '' : p2.points}`
  },

  formatTime(startTime) {
    if (!startTime) return ''
    const m = moment(startTime)
    if (!m.isValid()) return ''
    const timeFormat = (typeof config !== 'undefined' && config.timeFormat === 24) ? 'H:mm' : 'h:mm a'
    return m.local().format(timeFormat)
  },

  // Surname used for the short-code / logo slot: the last word of the name.
  surname(name) {
    if (!name) return ''
    const parts = String(name).trim().split(/\s+/)
    return parts[parts.length - 1]
  },

  // Filter the cached matches for one tour down to the configured players and
  // the requested day. Live and upcoming matches carry today's start time, so
  // the same day comparison keeps yesterday's request from showing them.
  getGames(tour, teams, gameDate) {
    const all = this.scores[tour] || []
    const isToday = moment(gameDate).isSame(moment(), 'day')
    return all.filter(game =>
      this.matchesTeams(game, teams) && this.matchesDate(game, gameDate, isToday),
    )
  },

  matchesTeams(game, teams) {
    if (!teams || teams.length === 0) return true
    const hay = `${game.hTeamLong} ${game.vTeamLong}`.toLowerCase()
    return teams.some(team => hay.includes(String(team).toLowerCase()))
  },

  matchesDate(game, gameDate, isToday) {
    if (game.startTime) {
      const start = moment(game.startTime)
      if (start.isValid()) return start.isSame(gameDate, 'day')
    }
    // No usable start time: only surface it on today's slate.
    return isToday
  },

  // First argument that is a non-empty string (numbers are stringified).
  pickString(...values) {
    for (const value of values) {
      if (typeof value === 'string' && value.trim()) return value.trim()
      if (typeof value === 'number') return String(value)
    }
    return ''
  },
}
