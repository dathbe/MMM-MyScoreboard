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

  PROVIDER_NAME: 'Scorepanel',

  LEAGUE_PATHS: {

    ALL_SOCCER: 'soccer/scorepanel',
    SOCCER_ON_TV: 'soccer/scorepanel',
    RSA_FIRST_DIV: 'soccer/rsa.2',
    RUGBY: 'rugby/scorepanel',

  },

  /*
    Used with isSoccer() so that we can quickly identify soccer leagues
    for score display patterns, instead of IFs for each league
   */
  SOCCER_LEAGUES: [

    // International
    'AFC_ASIAN_CUP',
    'AFC_ASIAN_CUP_Q',
    'AFF_CUP',
    'AFR_NATIONS_CUP',
    'AFR_NATIONS_CUP_Q',
    'CONCACAF_GOLD_CUP',
    'CONCACAF_NATIONS_Q',
    'CONCACAF_WOMENS_CHAMPIONSHIP',
    'CONMEBOL_COPA_AMERICA',
    'FIFA_CLUB_WORLD_CUP',
    'FIFA_CONFEDERATIONS_CUP',
    'FIFA_MENS_FRIENDLIES',
    'FIFA_MENS_OLYMPICS',
    'FIFA_WOMENS_FRIENDLIES',
    'FIFA_WOMENS_WORLD_CUP',
    'FIFA_WOMENS_OLYMPICS',
    'FIFA_WORLD_CUP',
    'FIFA_WORLD_CUP_Q_AFC',
    'FIFA_WORLD_CUP_Q_CAF',
    'FIFA_WORLD_CUP_Q_CONCACAF',
    'FIFA_WORLD_CUP_Q_CONMEBOL',
    'FIFA_WORLD_CUP_Q_OFC',
    'FIFA_WORLD_CUP_Q_UEFA',
    'FIFA_WORLD_U17',
    'FIFA_WORLD_U20',
    'UEFA_CHAMPIONS',
    'UEFA_EUROPA',
    'UEFA_EUROPEAN_CHAMPIONSHIP',
    'UEFA_EUROPEAN_CHAMPIONSHIP_Q',
    'UEFA_EUROPEAN_CHAMPIONSHIP_U19',
    'UEFA_EUROPEAN_CHAMPIONSHIP_U21',
    'UEFA_NATIONS',
    'SAFF_CHAMPIONSHIP',
    'WOMENS_EUROPEAN_CHAMPIONSHIP',

    // UK / Ireland
    'ENG_CARABAO_CUP',
    'ENG_CHAMPIONSHIP',
    'ENG_EFL',
    'ENG_FA_CUP',
    'ENG_LEAGUE_1',
    'ENG_LEAGUE_2',
    'ENG_NATIONAL',
    'ENG_PREMIERE_LEAGUE',
    'IRL_PREM',
    'NIR_PREM',
    'SCO_PREM',
    'SCO_CHAMPIONSHIP',
    'SCO_CHALLENGE_CUP',
    'SCO_CIS',
    'SCO_CUP',
    'SCO_LEAGUE_1',
    'SCO_LEAGUE_2',
    'WAL_PREM',

    // Europe
    'AUT_BUNDESLIGA',
    'BEL_DIV_A',
    'DEN_SAS_LIGAEN',
    'ESP_COPA_DEL_REY',
    'ESP_LALIGA',
    'ESP_SEGUNDA_DIV',
    'FRA_COUPE_DE_FRANCE',
    'FRA_COUPE_DE_LA_LIGUE',
    'FRA_LIGUE_1',
    'FRA_LIGUE_2',
    'GER_2_BUNDESLIGA',
    'GER_BUNDESLIGA',
    'GER_DFB_POKAL',
    'GRE_SUPER_LEAGUE',
    'ISR_PREMIER_LEAGUE',
    'ITA_COPPA_ITALIA',
    'ITA_SERIE_A',
    'ITA_SERIE_B',
    'MLT_PREMIER_LEAGUE',
    'NED_EERSTE_DIVISIE',
    'NED_EREDIVISIE',
    'NED_KNVB_BEKER',
    'NOR_ELITESERIEN',
    'POR_LIGA',
    'ROU_FIRST_DIV',
    'RUS_PREMIER_LEAGUE',
    'TUR_SUPER_LIG',
    'SUI_SUPER_LEAGUE',
    'SWE_ALLSVENSKANLIGA',

    // South America
    'ARG_COPA',
    'ARG_NACIONAL_B',
    'ARG_PRIMERA_DIV_B',
    'ARG_PRIMERA_DIV_C',
    'ARG_PRIMERA_DIV_D',
    'ARG_SUPERLIGA',
    'BOL_LIGA_PRO',
    'BRA_CAMP_CARIOCA',
    'BRA_CAMP_GAUCHO',
    'BRA_CAMP_MINEIRO',
    'BRA_CAMP_PAULISTA',
    'BRA_COPA',
    'BRA_SERIE_A',
    'BRA_SERIE_B',
    'BRA_SERIE_C',
    'CHI_COPA',
    'CHI_PRIMERA_DIV',
    'COL_COPA',
    'COL_PRIMERA_A',
    'COL_PRIMERA_B',
    'CONMEBOL_COPA_LIBERTADORES',
    'CONMEBOL_COPA_SUDAMERICANA',
    'ECU_PRIMERA_A',
    'PAR_PRIMERA_DIV',
    'PER_PRIMERA_PRO',
    'URU_PRIMERA_DIV',
    'VEN_PRIMERA_PRO',

    // North American
    'CONCACAF_CHAMPIONS',
    'CONCACAF_LEAGUE',
    'CRC_PRIMERA_DIV',
    'GUA_LIGA_NACIONAL',
    'HON_PRIMERA_DIV',
    'JAM_PREMIER_LEAGUE',
    'MEX_ASCENSO_MX',
    'MEX_COPA_MX',
    'MEX_LIGA_BANCOMER',
    'SLV_PRIMERA_DIV',
    'USA_MLS',
    'USA_NCAA_SL_M',
    'USA_NCAA_SL_W',
    'USA_NASL',
    'USA_NWSL',
    'USA_OPEN',
    'USA_USL',

    // Asia
    'AFC_CHAMPIONS',
    'AUS_A_LEAGUE',
    'CHN_SUPER_LEAGUE',
    'IDN_SUPER_LEAGUE',
    'IND_I_LEAGUE',
    'IND_SUPER_LEAGUE',
    'JPN_J_LEAGUE',
    'MYS_SUPER_LEAGUE',
    'SGP_PREMIER_LEAGUE',
    'THA_PREMIER_LEAGUE',

    // Africa
    'CAF_CHAMPIONS',
    'CAF_CONFED_CUP',
    'GHA_PREMIERE_LEAGUE',
    'KEN_PREMIERE_LEAGUE',
    'NGA_PRO_LEAGUE',
    'RSA_FIRST_DIV',
    'RSA_NEDBANK_CUP',
    'RSA_PREMIERSHIP',
    'RSA_TELKOM_KNOCKOUT',
    'UGA_SUPER_LEAGUE',
    'ZAM_SUPER_LEAGUE',
    'ZIM_PREMIER_LEAGUE',
  ],

  /* lastUpdate: {}, */
  broadcastIcons: ESPN.broadcastIcons,
  broadcastIconsInvert: ESPN.broadcastIconsInvert,
  /* bodyStorage: {}, */

  getLeaguePath: function (league) {
    return this.LEAGUE_PATHS[league]
  },

  async getScores(payload, gameDate, callback) {
    var self = this

    /* if (moment(gameDate).format('YYYYMMDD') === moment().format('YYYYMMDD')) {
      var storedDay = 'today'
    }
    else if (moment(gameDate).format('YYYYMMDD') === moment().subtract(1, 'days').format('YYYYMMDD')) {
      storedDay = 'yesterday'
    }
    else {
      storedDay = 'other'
    } */

    if (Object.keys(this.rugbyLeagues).includes(payload.league) || Object.values(this.rugbyLeagues).includes(payload.league)) {
      var sport = 'rugby'
    }
    else {
      sport = 'soccer'
    }
    var url = 'https://site.api.espn.com/apis/site/v2/sports/' + sport + '/scorepanel?dates=' + moment(gameDate).format('YYYYMMDD') + '&limit=200'

    // if (!this.lastUpdate[sport] || this.lastUpdate[sport] < moment().subtract(300, 'seconds')) {
    try {
      const response = await fetch(url)
      Log.debug(url + ' fetched for ' + payload.league)
      var body = await response.json()

      // if (this.getLeaguePath(payload.league).includes('scorepanel')) {
      // }
      /* if (!this.bodyStorage[sport]) {
        this.bodyStorage[sport] = {}
      } */
      /* this.bodyStorage[sport][storedDay] = body
      Log.debug(`Storage stored for ${payload.league}`)
      this.lastUpdate[sport] = moment() */
    }
    catch (error) {
      Log.error(error + ' ' + url)
    }
    // }
    // else {
    //  body = this.bodyStorage[sport][storedDay]
    //  Log.debug('it worked')
    // }
    for (let leagueIdx = 0; leagueIdx < body['scores'].length; leagueIdx++) {
      payload.label = body['scores'][leagueIdx]['leagues'][0]['name'] // `league${leagueIdx}`
      callback(self.formatScores(payload, body['scores'][leagueIdx], moment(gameDate).format('YYYYMMDD')))
    }
  },

  formatScores: function (payload, data, gameDate) {
    // var self = this;
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
        /* if (localGamesList.length > 0) {
          Log.info(`The local channels available for ${game.shortName} are: ${localGamesList.join(', ')}`)
        } */
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
          status.push('Delay')
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
          status.push(game.status.type.description)
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
      if (payload.league !== 'SOCCER_ON_TV' || (broadcast.length > 0)) {
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
        })
      }
    })

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
