/*

  -------------------------------------
    Provider for PWHL Scoreboard Data
  -------------------------------------

  Provides scores for
    PWHL (Professional Women's Hockey League)

*/

const Log = require('logger')
const moment = require('moment-timezone')

module.exports = {

  body: null,
  noGamesToday: false,
  year: 2023,
  POLL_FREQUENCY: 2 * 60 * 1000,

  getScores: function (payload, gameDate, callback) {
    var self = this

    if (this.body == null) {
      // start the data poll.  Set a timer to check every second to see if the scoresObj gets populated.
      this.firstRun(payload.league, payload.teams, gameDate)
      this.startedUp = true

      var waitForDataTimer = setInterval(function () {
        if (self.body != {}) {
          clearInterval(waitForDataTimer)
          waitForDataTimer = null

          callback(self.formatScores(payload.league, payload.teams, gameDate), payload.index, this.noGamesToday)
        }
      }, 2000)
    }
    else {
      callback(self.formatScores(payload.league, payload.teams, gameDate), payload.index, this.noGamesToday)
    }
  },

  firstRun: function (league, teams, gameDate) {
    this.grabData(league, teams, gameDate)
  },

  async grabData(league, teams, gameDate) {
    if (moment(gameDate).month() <= 6 || moment(gameDate).month() >= 10) {
      var month = -1
      this.year = moment(gameDate).year() - 1
      if (moment(gameDate).month() >= 8) {
        this.year = moment(gameDate).year()
      }
      var season = (this.year - 2022) * 3
      if (moment(gameDate).month() == 12 || moment(gameDate).month() <= 5) {
        season = season - 1
      }
      else if (moment(gameDate).month() <= 11) {
        season = season - 2
      }

      var grabComplete = false
      while (grabComplete == false && season < 10) {
        var url = `https://lscluster.hockeytech.com/feed/index.php?feed=statviewfeed&view=schedule&team=-1&season=${season}&month=${month}&location=homeaway&key=446521baf8c38984&client_code=pwhl&site_id=0&league_id=1&conference_id=-1&division_id=-1&lang=en&callback=angular.callbacks._2`
        try {
          const response = await fetch(url)
          Log.debug(`[MMM-MyScoreboard] ${url} fetched`)

          this.body = await response.text()
          this.body = this.body.slice(22, -2)
          this.body = JSON.parse(this.body)
          this.body = this.body['sections'][0]['data']
          var lastGameDate = moment(`${this.body[this.body.length - 1]['row']['date_with_day'].split(', ')[1]} ${this.year} 23:59`, 'MMM DD YYYY hh:mm').add(1, 'days')
          if (lastGameDate.month() < 8) {
            lastGameDate.add(1, 'years')
          }
          if (lastGameDate < moment(gameDate)) {
            season += 1
          }
          else {
            grabComplete = true
          }
        }
        catch (error) {
          Log.error(`[MMM-MyScoreboard] ${error} ${url}`)
        }
      }
    }
    else {
      this.body = {}
    }
    // this.formatScores(league, teams, gameDate)
    var self = this
    setTimeout(function () {
      self.grabData(league, teams, gameDate)
    }, this.POLL_FREQUENCY)
  },

  formatScores: function (league, teams, gameDate) {
    var formattedGames = []
    // var activeGame = false

    for (let i = 0; i < this.body.length; i++) {
      var curGameDate = moment(`${this.body[i]['row']['date_with_day'].split(', ')[1]} ${this.year}`, 'MMM DD YYYY')
      if (curGameDate.month() < 8) {
        curGameDate.add(1, 'years')
      }
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
        if (gameStatus.endsWith('EDT')) {
          gameStatus = 'scheduled'
        }
        switch (gameStatus) {
          case 'scheduled':
            gameState = 0
            var gameTime = this.body[i]['row']['game_status'].replace(' EDT', '')
            gameTime = moment.tz(gameTime, 'h:mm a', 'America/New_York')
            gameTime = gameTime.tz(moment.tz.guess()).format(timeFormat)
            status.push(gameTime)
            break
          case 'TBD':
            gameState = 0
            status.push(this.body[i]['row']['game_status'])
            break
          case 'Final':
            gameState = 2
            status.push(this.body[i]['row']['game_status'])
            break
          case 'Final OT':
            gameState = 2
            status.push(this.body[i]['row']['game_status'])
            break
          case 'Final SO':
            gameState = 2
            status.push(this.body[i]['row']['game_status'])
            break
          default:
            gameState = 1
            status.push(this.body[i]['row']['game_status'])
            // activeGame = true
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

    // this.POLL_FREQUENCY = 7 * 60 * 1000
    // if (activeGame == true) {
    //   this.POLL_FREQUENCY = 1 * 60 * 1000
    // }

    return formattedGames
  },

}
