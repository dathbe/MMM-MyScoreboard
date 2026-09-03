/*

  -------------------------------------
    Provider for PWHL Scoreboard Data
  -------------------------------------

  Provides scores for
    PWHL (Professional Women's Hockey League)

*/

const Log = require('logger')
const moment = require('moment-timezone')

const HT_KEY = '446521baf8c38984'
const SEASONS_URL = `https://lscluster.hockeytech.com/feed/index.php?feed=modulekit&view=seasons&key=${HT_KEY}&client_code=pwhl&fmt=json`
const SEASONS_TTL_MS = 24 * 60 * 60 * 1000

module.exports = {

  body: null,
  noGamesToday: false,
  seasonYears: { start: 2023, end: 2024 },
  seasonsCache: null, // { fetchedAt, seasons }
  POLL_FREQUENCY: 2 * 60 * 1000,

  getScores: function (payload, gameDate, callback) {
    var self = this

    if (this.body == null) {
      // Start the data poll. Set a timer to check every couple of seconds
      // to see if the schedule data gets populated.
      this.firstRun(payload.league, payload.teams, gameDate)
      this.startedUp = true

      var waitForDataTimer = setInterval(function () {
        if (Array.isArray(self.body)) {
          clearInterval(waitForDataTimer)
          waitForDataTimer = null

          callback(self.formatScores(payload.league, payload.teams, gameDate), payload.index, self.noGamesToday)
        }
      }, 2000)
    }
    else {
      callback(self.formatScores(payload.league, payload.teams, gameDate), payload.index, self.noGamesToday)
    }
  },

  firstRun: function (league, teams, gameDate) {
    this.grabData(league, teams, gameDate)
  },

  /*
    HockeyTech's seasons feed lists every PWHL season with its id, its
    date window, and whether it is a playoff season. The playoffs are a
    SEPARATE season id from the regular season (issue #205), so instead
    of deriving season ids arithmetically we pick whichever season's
    window contains the requested date.
  */
  async getSeasons() {
    if (this.seasonsCache && (Date.now() - this.seasonsCache.fetchedAt) < SEASONS_TTL_MS) {
      return this.seasonsCache.seasons
    }
    const response = await fetch(SEASONS_URL)
    Log.debug(`[MMM-MyScoreboard] ${SEASONS_URL} fetched`)
    if (!response.ok) {
      throw new Error(`HTTP ${response.status}`)
    }
    const body = await response.json()
    const seasons = (body && body.SiteKit && body.SiteKit.Seasons) ? body.SiteKit.Seasons : []
    if (seasons.length > 0) {
      this.seasonsCache = { fetchedAt: Date.now(), seasons: seasons }
    }
    return seasons
  },

  selectSeason: function (seasons, gameDate) {
    var dateStr = moment(gameDate).format('YYYY-MM-DD')
    var candidates = seasons.filter(function (s) {
      return s.start_date <= dateStr && dateStr <= s.end_date
    })
    if (candidates.length === 0) {
      return null
    }
    // Playoffs first, then regular season (career === '1'), then preseason
    candidates.sort(function (a, b) {
      if (a.playoff !== b.playoff) return a.playoff === '1' ? -1 : 1
      if (a.career !== b.career) return a.career === '1' ? -1 : 1
      return 0
    })
    return candidates[0]
  },

  async grabData(league, teams, gameDate) {
    this.noGamesToday = false
    try {
      var seasons = await this.getSeasons()
      var season = this.selectSeason(seasons, gameDate)

      if (season === null) {
        // Off-season: no PWHL season window contains this date
        this.body = []
      }
      else {
        // month=-1 pulls the season's whole schedule so date filtering
        // (including yesterday lookups) happens locally
        var url = `https://lscluster.hockeytech.com/feed/index.php?feed=statviewfeed&view=schedule&team=-1&season=${season.season_id}&month=-1&location=homeaway&key=${HT_KEY}&client_code=pwhl&site_id=0&league_id=1&conference_id=-1&division_id=-1&lang=en&callback=angular.callbacks._2`
        const response = await fetch(url)
        Log.debug(`[MMM-MyScoreboard] ${url} fetched`)

        var text = await response.text()
        // Strip the Angular JSONP wrapper
        var parsed = JSON.parse(text.slice(22, -2))
        if (parsed && parsed.sections && parsed.sections[0] && Array.isArray(parsed.sections[0].data)) {
          this.body = parsed.sections[0].data
          this.seasonYears = {
            start: parseInt(season.start_date.slice(0, 4), 10),
            end: parseInt(season.end_date.slice(0, 4), 10),
          }
        }
        else {
          this.body = []
        }
      }
    }
    catch (error) {
      Log.error(`[MMM-MyScoreboard] PWHL fetch failed: ${error}`)
      if (!Array.isArray(this.body)) {
        this.body = []
      }
    }

    // Single poll chain: a second getScores (e.g. yesterday's lookup)
    // must not orphan the previous chain's timer
    var self = this
    if (this.pollTimer) {
      clearTimeout(this.pollTimer)
    }
    this.pollTimer = setTimeout(function () {
      self.grabData(league, teams, gameDate)
    }, this.POLL_FREQUENCY)
  },

  formatScores: function (league, teams, gameDate) {
    var formattedGames = []

    if (!Array.isArray(this.body)) {
      this.noGamesToday = true
      return formattedGames
    }

    for (let i = 0; i < this.body.length; i++) {
      /*
        Schedule rows carry no year ("Thu, Apr 30") — attribute it from
        the selected season's window: Aug-Dec dates belong to the season's
        start year, Jan-Jul dates to its end year.
      */
      var datePart = this.body[i]['row']['date_with_day'].split(', ')[1]
      var parsedMonth = moment(datePart, 'MMM DD').month()
      var gameYear = parsedMonth >= 7 ? this.seasonYears.start : this.seasonYears.end
      var curGameDate = moment(`${datePart} ${gameYear}`, 'MMM DD YYYY')

      if (gameDate.startOf('day').diff(curGameDate.startOf('day'), 'days') == 0 && (teams == null || teams.indexOf(this.body[i]['row']['home_team_city']) > -1 || teams.indexOf(this.body[i]['row']['visiting_team_city']) > -1)) {
        var classes = []
        var gameState
        var status = []

        if (config.timeFormat === 24) {
          var timeFormat = 'H:mm'
        }
        else {
          timeFormat = 'h:mm a'
        }

        var gameStatus = this.body[i]['row']['game_status']
        // Scheduled games carry their start time with the Eastern zone
        // abbreviation — EDT in the fall, EST once daylight saving ends
        // (issue #205: EST games fell through to the in-progress branch)
        if (gameStatus.endsWith('EDT') || gameStatus.endsWith('EST')) {
          gameStatus = 'scheduled'
        }
        switch (gameStatus) {
          case 'scheduled':
            gameState = 0
            var gameTime = this.body[i]['row']['game_status'].replace(' EDT', '').replace(' EST', '')
            gameTime = moment.tz(gameTime, 'h:mm a', 'America/New_York')
            gameTime = gameTime.tz(moment.tz.guess()).format(timeFormat)
            status.push(gameTime)
            break
          case 'TBD':
            gameState = 0
            status.push(this.body[i]['row']['game_status'])
            break
          case 'Final':
          case 'Final OT':
          case 'Final SO':
            gameState = 2
            status.push(this.body[i]['row']['game_status'])
            break
          default:
            gameState = 1
            status.push(this.body[i]['row']['game_status'])
            break
        }

        var formattedGame = {
          classes: classes,
          gameMode: gameState,
          hTeam: this.body[i]['row']['home_team_city'],
          vTeam: this.body[i]['row']['visiting_team_city'],
          hTeamLong: this.body[i]['row']['home_team_city'],
          vTeamLong: this.body[i]['row']['visiting_team_city'],
          hTeamLogoUrl: '',
          vTeamLogoUrl: '',
          hScore: this.body[i]['row']['home_goal_count'],
          vScore: this.body[i]['row']['visiting_goal_count'],
          status: status,
        }

        formattedGames.push(formattedGame)
      }
    }

    if (formattedGames.length == 0) {
      this.noGamesToday = true
    }

    return formattedGames
  },

}
