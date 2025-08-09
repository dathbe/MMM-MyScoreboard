/*

  -------------------------------------
    Provider for ESPN Score Score Panel Data
  -------------------------------------

  Provides scores for
    Every Soccer league ESPN supports
    Every Rugby league ESPN supports

  ESPN has several different APIs for various sports data,
  most of which need an API key.  ESPN no longer gives out
  public API keys.  The good news is the Scoreboard API does
  not require an API key. It's free and clear.  Let's not
  abuse this.  Please do not modify this to hammer the API
  with a flood of calls, otherwise it might cause ESPN to
  lock this it down.

*/

const Log = require('logger')
const moment = require('moment-timezone')
const ESPN = require('./ESPN.js')

module.exports = {

  LEAGUE_PATHS: ESPN.LEAGUE_PATHS,

  /*
    Used with isSoccer() so that we can quickly identify soccer leagues
    for score display patterns, instead of IFs for each league
   */
  SOCCER_LEAGUES: ESPN.SOCCER_LEAGUES,

  broadcastIcons: ESPN.broadcastIcons,
  broadcastIconsInvert: ESPN.broadcastIconsInvert,

  async getScores(payload, gameDate, callback) {
    var self = this

    if (Object.keys(this.rugbyLeagues).includes(payload.league) || Object.values(this.rugbyLeagues).includes(payload.league)) {
      var sport = 'rugby'
    }
    else {
      sport = 'soccer'
    }
    var url = 'https://site.api.espn.com/apis/site/v2/sports/' + sport + '/scorepanel?dates=' + moment(gameDate).format('YYYYMMDD') + '&limit=200'

    try {
      const response = await fetch(url)
      Log.debug(`[MMM-MyScoreboard] ${url} fetched for ${payload.league}`)
      var body = await response.json()
    }
    catch (error) {
      Log.error(`[MMM-MyScoreboard] ${error} ${url}`)
    }
    this.totalGames = 0
    var noGamesToday = false
    for (let leagueIdx = 0; leagueIdx < body['scores'].length; leagueIdx++) {
      if (payload.league === 'ALL_SOCCER' || payload.league === 'SOCCER_ON_TV' || payload.league === 'SOCCER_ON_TV_NOW' || payload.league === 'RUGBY' || this.LEAGUE_PATHS[payload.league].endsWith(body['scores'][leagueIdx]['leagues'][0].slug)) {
        payload.label = body['scores'][leagueIdx]['leagues'][0]['name']
        if (leagueIdx === body['scores'].length - 1 && this.totalGames === 0 && payload.league !== 'SOCCER_ON_TV_NOW') {
          noGamesToday = true
        }
        callback(self.formatScores(payload, body['scores'][leagueIdx], moment(gameDate).format('YYYYMMDD')), payload.index + (leagueIdx / 1000), noGamesToday)
      }
    }
  },

  formatScores: function (payload, data, gameDate) {
    var formattedGamesList = new Array()
    var localTZ = moment.tz.guess()

    var filteredGamesList
    if (payload.teams != null) { // filter to teams list
      filteredGamesList = data.events.filter(function (game) {
        // if "@T25" is in the teams list, it indicates to include teams ranked in the top 25
        if (payload.teams.indexOf('@T25') != -1
          && ((game.competitions[0].competitors[0].curatedRank.current >= 1
            && game.competitions[0].competitors[0].curatedRank.current <= 25)
          || (game.competitions[0].competitors[1].curatedRank.current >= 1
            && game.competitions[0].competitors[1].curatedRank.current <= 25))) {
          return true
        }

        return payload.teams.indexOf(game.competitions[0].competitors[0].team.abbreviation) != -1
          || payload.teams.indexOf(game.competitions[0].competitors[1].team.abbreviation) != -1
      })
    }
    else { // return all games
      filteredGamesList = data.events
    }

    filteredGamesList = filteredGamesList.filter(function (event) {
      const eventDate = moment.tz(event.date, localTZ).format('YYYYMMDD')
      return eventDate === gameDate
    })

    // sort by start time, then by away team shortcode.
    filteredGamesList.sort(function (a, b) {
      var aTime = moment(a.competitions[0].date)
      var bTime = moment(b.competitions[0].date)

      // first sort by start time
      if (aTime.isBefore(bTime)) {
        return -1
      }
      if (aTime.isAfter(bTime)) {
        return 1
      }

      // start times are the same.  Now sort by away team short codes
      var aTteam = (a.competitions[0].competitors[0].homeAway == 'away'
        ? a.competitions[0].competitors[0].team.abbreviation
        : a.competitions[0].competitors[1].team.abbreviation)

      var bTteam = (b.competitions[0].competitors[0].homeAway == 'away'
        ? b.competitions[0].competitors[0].team.abbreviation
        : b.competitions[0].competitors[1].team.abbreviation)

      if (aTteam < bTteam) {
        return -1
      }
      if (aTteam > bTteam) {
        return 1
      }

      return 0
    })

    // iterate through games and construct formattedGamesList
    filteredGamesList.forEach((game) => {
      var status = []
      var broadcast = []
      var classes = []

      var gameState = 0

      var hTeamData = game.competitions[0].competitors[0]
      var vTeamData = game.competitions[0].competitors[1]

      /*
        Looks like the home team is always the first in the feed, but it also specified,
        so we can be sure.
      */

      if (hTeamData.homeAway == 'away') {
        hTeamData = game.competitions[0].competitors[1]
        vTeamData = game.competitions[0].competitors[0]
      }

      /*
        Not all of ESPN's status.type.id's are supported here.
        Some are for sports that this provider doesn't yet
        support, and some are so rare that we'll likely never
        see it.  These cases are handled in the 'default' block.
      */
      if (config.timeFormat === 24) {
        var timeFormat = 'H:mm'
      }
      else {
        timeFormat = 'h:mm a'
      }
      var channels = []

      if (game.competitions[0].broadcasts.length > 0 && !payload.hideBroadcasts) {
        game.competitions[0].broadcasts.forEach((market) => {
          if (market.market === 'national') {
            market.names.forEach((channelName) => {
              var localDesignation = ''
              if (channelName.startsWith('FanDuel')) {
                localDesignation = channelName.replace('FanDuel ', '')
                localDesignation = localDesignation.replace('SN ', '')
                localDesignation = `<span class="FanDuel">${localDesignation}</span>`
                channelName = 'FanDuel'
              }
              else if (channelName.startsWith('NBC Sports')) {
                localDesignation = channelName.replace('NBC Sports ', '')
                localDesignation = `<span class="NBCSports">${localDesignation}</span>`
                channelName = 'NBC Sports'
              }
              else if (channelName === 'Space City Home (Alt.)') {
                localDesignation = '(Alt.)'
                localDesignation = `<span class="SpaceCityHome">${localDesignation}</span>`
                channelName = 'Space City Home Network'
              }
              else if (channelName === 'MSGB') {
                localDesignation = 'B'
                localDesignation = `<span class="MSG">${localDesignation}</span>`
                channelName = 'MSG'
              }
              if (!payload.skipChannels.includes(channelName)) {
                if (this.broadcastIcons[channelName] !== undefined) {
                  channels.push(`<img src="${this.broadcastIcons[channelName]}" class="broadcastIcon">${localDesignation}`)
                }
                else if (this.broadcastIconsInvert[channelName] !== undefined) {
                  channels.push(`<img src="${this.broadcastIconsInvert[channelName]}" class="broadcastIcon broadcastIconInvert">${localDesignation}`)
                }
                else {
                  channels.push(channelName)
                }
              }
            })
          }
        })
        var localGamesList = []
        game.competitions[0].broadcasts.forEach((market) => {
          market.names.forEach((channelName) => {
            var localDesignation = ''
            if (channelName.startsWith('FanDuel')) {
              localDesignation = channelName.replace('FanDuel ', '')
              localDesignation = localDesignation.replace('SN ', '')
              localDesignation = `<span class="FanDuel">${localDesignation}</span>`
              channelName = 'FanDuel'
            }
            else if (channelName.startsWith('NBC Sports')) {
              localDesignation = channelName.replace('NBC Sports ', '')
              localDesignation = `<span class="NBCSports">${localDesignation}</span>`
              channelName = 'NBC Sports'
            }
            else if (channelName === 'Space City Home (Alt.)') {
              localDesignation = '(Alt.)'
              localDesignation = `<span class="SpaceCityHome">${localDesignation}</span>`
              channelName = 'Space City Home Network'
            }
            else if (channelName === 'MSGB') {
              localDesignation = 'B'
              localDesignation = `<span class="MSG">${localDesignation}</span>`
              channelName = 'MSG'
            }
            var homeAwayWanted = []
            for (let competitorIdx = 0; competitorIdx < game.competitions[0]['competitors'].length; competitorIdx++) {
              if (game.competitions[0]['competitors'][competitorIdx]['homeAway'] === market.market && payload.localMarkets.includes(game.competitions[0]['competitors'][competitorIdx]['team']['abbreviation'])) {
                homeAwayWanted.push(market.market)
              }
            }
            if (((payload.showLocalBroadcasts || homeAwayWanted.includes(market.market)) && !payload.skipChannels.includes(channelName)) || payload.displayLocalChannels.includes(channelName)) {
              if (this.broadcastIcons[channelName] !== undefined) {
                channels.push(`<img src="${this.broadcastIcons[channelName]}" class="broadcastIcon">${localDesignation}`)
              }
              else if (this.broadcastIconsInvert[channelName] !== undefined) {
                channels.push(`<img src="${this.broadcastIconsInvert[channelName]}" class="broadcastIcon broadcastIconInvert">${localDesignation}`)
              }
              else {
                channels.push(channelName)
              }
            }
            else if (!payload.showLocalBroadcasts && !payload.skipChannels.includes(channelName) && !payload.displayLocalChannels.includes(channelName)) {
              localGamesList.push(channelName)
            }
          })
        })
      }
      channels = [...new Set(channels)]

      switch (game.status.type.id) {
        // Not started
        case '5': // cancelled
        case '6': // postponed
          gameState = 0
          status.push(game.status.type.detail)
          break
        case '0' : // TBD
          gameState = 0
          status.push('TBD')
          break
        case '8': // suspended
          gameState = 0
          status.push('Suspended')
          break
        case '1': // scheduled
          gameState = 0
          status.push(moment(game.competitions[0].date).tz(localTZ).format(timeFormat))
          broadcast = channels
          break

        // In progress
        case '2': // in-progress
        case '21': // beginning of period
        case '22': // end period
        case '24': // overtime
        case '25': // SOCCER first half
        case '26': // SOCCER second half
        case '43': // SOCCER Golden Time
        case '44': // Shootout
        case '48': // SOCCER end extra time
          gameState = 1
          status.push(game.status.type.shortDetail)
          broadcast = channels
          break
        case '23': // halftime
          gameState = 1
          status.push(game.status.type.description)
          broadcast = channels
          break
        case '7': // delayed
        case '17': // rain delay
          gameState = 1
          classes.push['delay']
          status.push(game.status.type.description) // shortDetail is too long for baseball ("Rain Delay, Top 1st")
          broadcast = channels
          break
        case '49': // SOCCER extra time half time
          gameState = 1
          status.push('HALFTIME (ET)')
          broadcast = channels
          break

        // Completed
        case '3': // final
        case '28': // SOCCER Full Time
          gameState = 2
          status.push(game.status.type.shortDetail) // or .description?  hopefully this doesn't mess up other leagues
          // broadcast = channels
          break
        case '45': // SOCCER Final ET
        case '46': // SOCCER final score - after golden goal
          gameState = 2
          status.push('FT (AET)')
          break
        case '47': // Soccer Final PK
          gameState = 2
          status.push('FT (PK) ' + this.getFinalPK(hTeamData, vTeamData))
          break
        case '4': // forfeit
        case '9': // forfeit of home team
        case '10': // forfeit of away team
          gameState = 2
          status.push('Forfeit')
          break

        // Other
        default: // Anything else, grab the description ESPN gives
          gameState = 0
          status.push(game.status.type.detail)
          break
      }

      /*
        WTF...
        for NCAAF, sometimes FCS teams (I-AA) play FBS (I-A) teams.  These are known as money
        games. As such, the logos directory contains images for all of the FCS teams as well
        as the FBS teams.  Wouldn't you know it but there is a SDSU in both divisions --
        totally different schools!!!
        So we'll deal with it here.  There is an SDSU logo file with a space at the end of
        its name (e.g.: "SDSU .png" that is for the FCS team.  We'll use that abbreviation
        which will load a different logo file, but the extra space will collapse in HTML
        when the short code is displayed).

        The big irony here is that the SAME school as the FCS SDSU has a different ESPN short
        code for basketball: SDST.
      */

      if (payload.league == 'NCAAF' && hTeamData.team.abbreviation == 'SDSU' && hTeamData.team.location.indexOf('South Dakota State') != -1) {
        hTeamData.team.abbreviation = 'SDSU '
      }
      else if (payload.league == 'NCAAF' && vTeamData.team.abbreviation == 'SDSU' && vTeamData.team.location.indexOf('South Dakota State') != -1) {
        vTeamData.team.abbreviation = 'SDSU '
      }

      // determine which display name to use
      var hTeamLong = ''
      var vTeamLong = ''
      // For college sports, use the displayName property
      if (payload.league == 'NCAAF' || payload.league == 'NCAAM') {
        hTeamLong = (hTeamData.team.abbreviation == undefined ? '' : hTeamData.team.abbreviation + ' ') + hTeamData.team.name
        vTeamLong = (vTeamData.team.abbreviation == undefined ? '' : vTeamData.team.abbreviation + ' ') + vTeamData.team.name
      }
      else { // use the shortDisplayName property
        hTeamLong = hTeamData.team.shortDisplayName
        vTeamLong = vTeamData.team.shortDisplayName
      }

      /* if (payload.league === 'SOCCER_ON_TV') {
        broadcast = channels
      } */

      if (game.competitions[0].series !== undefined) {
        var playoffStatus = []
        if (game.competitions[0].notes !== undefined && game.competitions[0].notes[0] !== undefined && game.competitions[0].notes[0].headline !== undefined) {
          playoffStatus.push(game.competitions[0].notes[0].headline)
        }
        else if (game.competitions[0].leg !== undefined && game.competitions[0].leg.displayValue !== undefined) {
          playoffStatus.push(game.competitions[0].leg.displayValue)
        }
        if (game.competitions[0].series.summary !== undefined) {
          playoffStatus.push(game.competitions[0].series.summary)
        }
        else if (game.competitions[0].series.title !== undefined) {
          playoffStatus.unshift(game.competitions[0].series.title)
        }
        if (playoffStatus.length > 0) {
          playoffStatus = playoffStatus.join(' - ')
        }
        else {
          playoffStatus = ''
          Log.debug('There\'s a playoff series, but it\'s not standard type:')
          Log.debug(game.competitions[0].notes)
          Log.debug(game.competitions[0].series)
        }
      }
      else {
        playoffStatus = ''
      }

      if ((payload.league !== 'SOCCER_ON_TV' && payload.league !== 'SOCCER_ON_TV_NOW')
        || (payload.league === 'SOCCER_ON_TV' && broadcast.length > 0)
        || (payload.league === 'SOCCER_ON_TV_NOW' && broadcast.length > 0 && gameState == 1)) {
        Log.debug(payload.league, gameState, hTeamLong)

        formattedGamesList.push({
          classes: classes,
          gameMode: gameState,
          hTeam: hTeamData.team.abbreviation == undefined ? hTeamData.team.name.substring(0, 4).toUpperCase() + ' ' : hTeamData.team.abbreviation,
          vTeam: vTeamData.team.abbreviation == undefined ? vTeamData.team.name.substring(0, 4).toUpperCase() + ' ' : vTeamData.team.abbreviation,
          hTeamLong: hTeamLong,
          vTeamLong: vTeamLong,
          hTeamRanking: (payload.league == 'NCAAF' || payload.league == 'NCAAM') ? this.formatT25Ranking(hTeamData.curatedRank.current) : null,
          vTeamRanking: (payload.league == 'NCAAF' || payload.league == 'NCAAM') ? this.formatT25Ranking(vTeamData.curatedRank.current) : null,
          hScore: parseInt(hTeamData.score),
          vScore: parseInt(vTeamData.score),
          status: status,
          broadcast: broadcast,
          hTeamLogoUrl: hTeamData.team.logo ? hTeamData.team.logo : '',
          vTeamLogoUrl: vTeamData.team.logo ? vTeamData.team.logo : '',
          playoffStatus: playoffStatus,
        })
      }
    })

    this.totalGames += formattedGamesList.length
    return formattedGamesList
  },

  formatT25Ranking: function (rank) {
    if (rank >= 1 && rank <= 25) {
      return rank
    }
    return null
  },

  getOrdinal: function (p) {
    var mod10 = p % 10
    var mod100 = p % 100

    if (mod10 == 1 && mod100 != 11) {
      return p + '<sup>ST</sup>'
    }
    if (mod10 == 2 && mod100 != 12) {
      return p + '<sup>ND</sup>'
    }
    if (mod10 == 3 && mod100 != 13) {
      return p + '<sup>RD</sup>'
    }

    return p + '<sup>TH</sup>'
  },

  getPeriod: function (league, p) {
    // check for overtime, otherwise return ordinal
    if (this.isSoccer(league)) {
      if (p > 2) {
        return 'ET'
      }
      else {
        return '' // no need to indicate first or second half
      }
    }
    else {
      if (p == 5) {
        return 'OT'
      }
      else if (p > 5) {
        return (p - 4) + 'OT'
      }
    }

    return this.getOrdinal(p)
  },

  getFinalOT: function (league, p) {
    if (this.isSoccer(league) && p > 2) {
      return ' (ET)'
    }
    else if (league === 'MLB') {
      if (p > 9) {
        return ' (' + p + ')'
      }
    }
    else if (!this.isSoccer(league)) {
      if (p == 5) {
        return ' (OT)'
      }
      else if (p > 5) {
        return ' (' + (p - 4) + 'OT)'
      }
    }

    return ''
  },

  getFinalPK: function (hTeamData, vTeamData) {
    return hTeamData.shootoutScore + 'x' + vTeamData.shootoutScore
  },

  isSoccer: function (league) {
    return (this.SOCCER_LEAGUES.indexOf(league) !== -1)
  },

  rugbyLeagues: {
    'RUGBY': 'Rugby',
    'PREMIERSHIP_RUGBY': 'Premiership Rugby',
    'RUGBY_WORLD_CUP': 'Rugby World Cup',
    'SIX_NATIONS': 'Six Nations',
    'THE_RUGBY_CHAMPIONSHIP': 'The Rugby Championship',
    'EUROPEAN_RUGBY_CHAMPIONS_CUP': 'European Rugby Champions Cup',
    'UNITED_RUGBY_CHAMPIONSHIP': 'United Rugby Championship',
    'SUPER_RUGBY_PACIFIC': 'Super Rugby Pacific',
    'OLYMPIC_MENS_7S': 'Olympic Men\'s 7s',
    'OLYMPIC_WOMENS_RUGBY_SEVENS': 'Olympic Women\'s Rugby Sevens',
    'INTERNATIONAL_TEST_MATCH': 'International Test Match',
    'URBA_TOP_12': 'URBA Top 12',
    'MITRE_10_CUP': 'Mitre 10 Cup',
    'Major League Rugby': 'Major League Rugby',
  },

}
