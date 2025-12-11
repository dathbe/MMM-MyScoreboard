const moment = require('moment-timezone')
const Log = require('logger')

const SEASON_ID = 'cpl::Football_Season::fd43e1d61dfe4396a7356bc432de0007'
const MATCHES_URL = `https://api-sdp.canpl.ca/v1/cpl/football/seasons/${encodeURIComponent(SEASON_ID)}/matches?locale=en-US`

module.exports = {
  PROVIDER_NAME: 'CPL',
  POLL_FREQUENCY: 60 * 1000, // Refresh every minute
  scoresObj: null,
  dataPollStarted: false,

  getScores(payload, gameDate, callback) {
    if (!this.dataPollStarted) this.startDataPoll()

    const waitForData = setInterval(() => {
      if (this.scoresObj) {
        clearInterval(waitForData)
        callback({
          label: 'CPL',
          scores: this.getLeague(payload.teams),
          index: payload.index,
        })
      }
    }, 500)

    // Timeout after 10 seconds
    setTimeout(() => clearInterval(waitForData), 10000)
  },

  startDataPoll() {
    this.dataPollStarted = true
    this.getData()
    setInterval(() => this.getData(), this.POLL_FREQUENCY)
  },

  async getData() {
    try {
      const res = await fetch(MATCHES_URL)
      if (!res.ok) {
        throw new Error(`HTTP ${res.status} - ${res.statusText}`)
      }
      const data = await res.json()

      const games = (data.matches || []).map((match) => {
        const tHome = match.homeTeam?.mediaName || match.homeTeam?.shortName || match.homeTeam?.name
        const tAway = match.awayTeam?.mediaName || match.awayTeam?.shortName || match.awayTeam?.name

        const homeLogo = match.homeTeam?.crest || match.homeTeam?.logo || null
        const awayLogo = match.awayTeam?.crest || match.awayTeam?.logo || null

        const startTime = match.startDateUtc
          ? moment.utc(match.startDateUtc).toISOString()
          : null

        const homeScore = (match.score?.fullTime?.homeTeam != null)
          ? match.score.fullTime.homeTeam
          : null
        const awayScore = (match.score?.fullTime?.awayTeam != null)
          ? match.score.fullTime.awayTeam
          : null

        return {
          homeTeam: tHome,
          awayTeam: tAway,
          homeTeamLong: tHome,
          awayTeamLong: tAway,
          homeTeamLogoUrl: homeLogo,
          awayTeamLogoUrl: awayLogo,
          homeScore: homeScore,
          awayScore: awayScore,
          startTime: startTime,
          gameMode: (homeScore != null && awayScore != null) ? 2 : 0, // 0 = scheduled, 2 = final
        }
      })

      this.scoresObj = games
      Log.info(`[MMM-MyScoreboard] CPL matches fetched successfully (${games.length} games)`)
    }
    catch (err) {
      Log.error(`[MMM-MyScoreboard] Error fetching CPL matches: ${err}`)
    }
  },

  getLeague(teams) {
    if (!this.scoresObj) return []
    return teams
      ? this.scoresObj.filter(g =>
          teams.includes(g.homeTeam) || teams.includes(g.awayTeam),
        )
      : this.scoresObj
  },
}
