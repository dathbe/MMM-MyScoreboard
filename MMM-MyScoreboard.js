/*********************************

 MagicMirror² Module:
 MMM-MyScoreboard
 https://github.com/dathbe/MMM-MyScoreboard

 Originally by Jeff Clarke
 Maintained by dathbe
 MIT Licensed

 *********************************/

Module.register('MMM-MyScoreboard', {

  // Default module config.
  defaults: {
    showLeagueSeparators: true,
    colored: true,
    rolloverHours: 3, // hours past midnight to show the pervious day's scores
    alwaysShowToday: false, // show BOTH today and yesterday during rolloverHours
    shadeRows: false,
    highlightWinners: true,
    viewStyle: 'largeLogos',
    showRankings: true,
    hideBroadcasts: false,
    showLocalBroadcasts: false,
    skipChannels: [],
    localMarkets: [],
    displayLocalChannels: [],
    channelRotateInterval: 7000,
    scrollSpeed: 6,
    maxHeight: 10000,
    // limitBroadcasts: 1,
    debugHours: 0,
    debugMinutes: 0,
    showPlayoffStatus: false,
    sports: [
      {
        league: 'NHL',
        teams: ['TOR'],
      },
      {
        league: 'NBA',
        teams: ['TOR'],
      },
      {
        league: 'MLB',
        teams: ['TOR'],
      },
      {
        league: 'CFL',
        teams: ['TOR'],
      },
    ],
  },

  supportedLeagues: {

    /*

      logoFormat is no longer used.  The module makes a catalog of what
      logos are present locally and uses them when available.
      Otherwise the log image URL provided by the data feed is used.

      In the spirit of "if it ain't broke, don't  fix it," I'll leave
      the logoFormat parameter in place.  Who knows... I might use it
      for something else in the future.

    */

    // North American Leagues
    'NBA': { provider: 'ESPN', logoFormat: 'svg' },
    'NHL': { provider: 'ESPN', logoFormat: 'svg' },
    'NFL': { provider: 'ESPN', logoFormat: 'svg' },
    'CFL': { provider: 'SNET', logoFormat: 'svg' },
    'MLB': { provider: 'ESPN', logoFormat: 'svg' },
    'WBC': { provider: 'SNET', logoFormat: 'svg' },

    'NCAAF': { provider: 'ESPN', logoFormat: 'url' },
    'NCAAM': { provider: 'ESPN', logoFormat: 'url' },
    'NCAAM_MM': { provider: 'ESPN', logoFormat: 'url' },
    'NCAAW': { provider: 'ESPN', logoFormat: 'url' },
    'WNBA': { provider: 'ESPN', logoFormat: 'url' },
    'NBAG': { provider: 'ESPN', logoFormat: 'url' },
    'NLL': { provider: 'ESPN', logoFormat: 'url' },
    'PLL': { provider: 'ESPN', logoFormat: 'url' },

    // International Soccer
    'ALL_SOCCER': { provider: 'Scorepanel', logoFormat: 'url', homeTeamFirst: true },
    'SOCCER_ON_TV': { provider: 'Scorepanel', logoFormat: 'url', homeTeamFirst: true },
    'SOCCER_ON_TV_NOW': { provider: 'Scorepanel', logoFormat: 'url', homeTeamFirst: true },
    'AFC_ASIAN_CUP': { provider: 'ESPN', logoFormat: 'url', homeTeamFirst: true },
    'AFC_ASIAN_CUP_Q': { provider: 'ESPN', logoFormat: 'url', homeTeamFirst: true },
    'AFF_CUP': { provider: 'ESPN', logoFormat: 'url', homeTeamFirst: true },
    'AFR_NATIONS_CUP': { provider: 'ESPN', logoFormat: 'url', homeTeamFirst: true },
    'AFR_NATIONS_CUP_Q': { provider: 'ESPN', logoFormat: 'url', homeTeamFirst: true },
    'AFR_NATIONS_Q': { provider: 'ESPN', logoFormat: 'url', homeTeamFirst: true },
    'CONCACAF_GOLD_CUP': { provider: 'ESPN', logoFormat: 'url', homeTeamFirst: true },
    'CONCACAF_NATIONS_Q': { provider: 'ESPN', logoFormat: 'url', homeTeamFirst: true },
    'CONCACAF_WOMENS_CHAMPIONSHIP': { provider: 'ESPN', logoFormat: 'url', homeTeamFirst: true },
    'CONMEBOL_COPA_AMERICA': { provider: 'ESPN', logoFormat: 'url', homeTeamFirst: true },
    'FIFA_CLUB_WORLD_CUP': { provider: 'ESPN', logoFormat: 'url', homeTeamFirst: true },
    'FIFA_CONFEDERATIONS_CUP': { provider: 'ESPN', logoFormat: 'url', homeTeamFirst: true },
    'FIFA_MENS_FRIENDLIES': { provider: 'ESPN', logoFormat: 'url', homeTeamFirst: true },
    'FIFA_MENS_OLYMPICS': { provider: 'ESPN', logoFormat: 'url', homeTeamFirst: true },
    'FIFA_WOMENS_FRIENDLIES': { provider: 'ESPN', logoFormat: 'url', homeTeamFirst: true },
    'FIFA_WOMENS_OLYMPICS': { provider: 'ESPN', logoFormat: 'url', homeTeamFirst: true },
    'FIFA_WOMENS_WORLD_CUP': { provider: 'ESPN', logoFormat: 'url', homeTeamFirst: true },
    'FIFA_WORLD_CUP': { provider: 'ESPN', logoFormat: 'url', homeTeamFirst: true },
    'FIFA_WORLD_CUP_Q_AFC': { provider: 'ESPN', logoFormat: 'url', homeTeamFirst: true },
    'FIFA_WORLD_CUP_Q_CAF': { provider: 'ESPN', logoFormat: 'url', homeTeamFirst: true },
    'FIFA_WORLD_CUP_Q_CONCACAF': { provider: 'ESPN', logoFormat: 'url', homeTeamFirst: true },
    'FIFA_WORLD_CUP_Q_CONMEBOL': { provider: 'ESPN', logoFormat: 'url', homeTeamFirst: true },
    'FIFA_WORLD_CUP_Q_OFC': { provider: 'ESPN', logoFormat: 'url', homeTeamFirst: true },
    'FIFA_WORLD_CUP_Q_UEFA': { provider: 'ESPN', logoFormat: 'url', homeTeamFirst: true },
    'FIFA_WORLD_U17': { provider: 'ESPN', logoFormat: 'url', homeTeamFirst: true },
    'FIFA_WORLD_U20': { provider: 'ESPN', logoFormat: 'url', homeTeamFirst: true },
    'UEFA_CHAMPIONS': { provider: 'ESPN', logoFormat: 'url', homeTeamFirst: true },
    'UEFA_WOMENS_CHAMPIONS': { provider: 'ESPN', logoFormat: 'url', homeTeamFirst: true },
    'UEFA_EUROPEAN_CHAMPIONSHIP': { provider: 'ESPN', logoFormat: 'url', homeTeamFirst: true },
    'UEFA_EUROPEAN_CHAMPIONSHIP_Q': { provider: 'ESPN', logoFormat: 'url', homeTeamFirst: true },
    'UEFA_EUROPEAN_CHAMPIONSHIP_U19': { provider: 'ESPN', logoFormat: 'url', homeTeamFirst: true },
    'UEFA_EUROPEAN_CHAMPIONSHIP_U21': { provider: 'ESPN', logoFormat: 'url', homeTeamFirst: true },
    'UEFA_EUROPA': { provider: 'ESPN', logoFormat: 'url', homeTeamFirst: true },
    'UEFA_EUROPA_CONF': { provider: 'ESPN', logoFormat: 'url', homeTeamFirst: true },
    'UEFA_NATIONS': { provider: 'ESPN', logoFormat: 'url', homeTeamFirst: true },
    'SAFF_CHAMPIONSHIP': { provider: 'ESPN', logoFormat: 'url', homeTeamFirst: true },
    'WOMENS_EUROPEAN_CHAMPIONSHIP': { provider: 'ESPN', logoFormat: 'url', homeTeamFirst: true },
    'UEFA_WOMENS_NATIONS': { provider: 'ESPN', logoFormat: 'url', homeTeamFirst: true },

    // UK / Ireland Soccer
    'ENG_CARABAO_CUP': { provider: 'ESPN', logoFormat: 'url', homeTeamFirst: true },
    'ENG_CHAMPIONSHIP': { provider: 'ESPN', logoFormat: 'url', homeTeamFirst: true },
    'ENG_EFL': { provider: 'ESPN', logoFormat: 'url', homeTeamFirst: true },
    'ENG_FA_CUP': { provider: 'ESPN', logoFormat: 'url', homeTeamFirst: true },
    'ENG_LEAGUE_1': { provider: 'ESPN', logoFormat: 'url', homeTeamFirst: true },
    'ENG_LEAGUE_2': { provider: 'ESPN', logoFormat: 'url', homeTeamFirst: true },
    'ENG_NATIONAL': { provider: 'ESPN', logoFormat: 'url', homeTeamFirst: true },
    'English Premier League': { provider: 'ESPN', logoFormat: 'url', homeTeamFirst: true },
    'IRL_PREM': { provider: 'ESPN', logoFormat: 'url', homeTeamFirst: true },
    'NIR_PREM': { provider: 'ESPN', logoFormat: 'url', homeTeamFirst: true },
    'SCO_CHALLENGE_CUP': { provider: 'ESPN', logoFormat: 'url', homeTeamFirst: true },
    'SCO_CHAMPIONSHIP': { provider: 'ESPN', logoFormat: 'url', homeTeamFirst: true },
    'SCO_CIS': { provider: 'ESPN', logoFormat: 'url', homeTeamFirst: true },
    'SCO_CUP': { provider: 'ESPN', logoFormat: 'url', homeTeamFirst: true },
    'SCO_LEAGUE_1': { provider: 'ESPN', logoFormat: 'url', homeTeamFirst: true },
    'SCO_LEAGUE_2': { provider: 'ESPN', logoFormat: 'url', homeTeamFirst: true },
    'SCO_PREM': { provider: 'ESPN', logoFormat: 'url', homeTeamFirst: true },
    'WAL_PREM': { provider: 'ESPN', logoFormat: 'url', homeTeamFirst: true },
    'ENG_WSL': { provider: 'ESPN', logoFormat: 'url', homeTeamFirst: true },

    // European Soccer
    'AUT_BUNDESLIGA': { provider: 'ESPN', logoFormat: 'url', homeTeamFirst: true },
    'BEL_DIV_A': { provider: 'ESPN', logoFormat: 'url', homeTeamFirst: true },
    'DEN_SAS_LIGAEN': { provider: 'ESPN', logoFormat: 'url', homeTeamFirst: true },
    'ESP_COPA_DEL_REY': { provider: 'ESPN', logoFormat: 'url', homeTeamFirst: true },
    'ESP_LALIGA': { provider: 'ESPN', logoFormat: 'url', homeTeamFirst: true },
    'ESP_SEGUNDA_DIV': { provider: 'ESPN', logoFormat: 'url', homeTeamFirst: true },
    'FRA_COUPE_DE_FRANCE': { provider: 'ESPN', logoFormat: 'url', homeTeamFirst: true },
    'FRA_COUPE_DE_LA_LIGUE': { provider: 'ESPN', logoFormat: 'url', homeTeamFirst: true },
    'FRA_LIGUE_1': { provider: 'ESPN', logoFormat: 'url', homeTeamFirst: true },
    'FRA_LIGUE_2': { provider: 'ESPN', logoFormat: 'url', homeTeamFirst: true },
    'GER_2_BUNDESLIGA': { provider: 'ESPN', logoFormat: 'url', homeTeamFirst: true },
    'GER_BUNDESLIGA': { provider: 'ESPN', logoFormat: 'url', homeTeamFirst: true },
    'GER_DFB_POKAL': { provider: 'ESPN', logoFormat: 'url', homeTeamFirst: true },
    'GRE_SUPER_LEAGUE': { provider: 'ESPN', logoFormat: 'url', homeTeamFirst: true },
    'ISR_PREMIER_LEAGUE': { provider: 'ESPN', logoFormat: 'url', homeTeamFirst: true },
    'MLT_PREMIER_LEAGUE': { provider: 'ESPN', logoFormat: 'url', homeTeamFirst: true },
    'ITA_COPPA_ITALIA': { provider: 'ESPN', logoFormat: 'url', homeTeamFirst: true },
    'ITA_SERIE_A': { provider: 'ESPN', logoFormat: 'url', homeTeamFirst: true },
    'ITA_SERIE_B': { provider: 'ESPN', logoFormat: 'url', homeTeamFirst: true },
    'NED_EERSTE_DIVISIE': { provider: 'ESPN', logoFormat: 'url', homeTeamFirst: true },
    'NED_EREDIVISIE': { provider: 'ESPN', logoFormat: 'url', homeTeamFirst: true },
    'NED_KNVB_BEKER': { provider: 'ESPN', logoFormat: 'url', homeTeamFirst: true },
    'NOR_ELITESERIEN': { provider: 'ESPN', logoFormat: 'url', homeTeamFirst: true },
    'POR_LIGA': { provider: 'ESPN', logoFormat: 'url', homeTeamFirst: true },
    'ROU_FIRST_DIV': { provider: 'ESPN', logoFormat: 'url', homeTeamFirst: true },
    'RUS_PREMIER_LEAGUE': { provider: 'ESPN', logoFormat: 'url', homeTeamFirst: true },
    'SUI_SUPER_LEAGUE': { provider: 'ESPN', logoFormat: 'url', homeTeamFirst: true },
    'SWE_ALLSVENSKANLIGA': { provider: 'ESPN', logoFormat: 'url', homeTeamFirst: true },
    'TUR_SUPER_LIG': { provider: 'ESPN', logoFormat: 'url', homeTeamFirst: true },

    // South American Soccer
    'ARG_COPA': { provider: 'ESPN', logoFormat: 'url', homeTeamFirst: true },
    'ARG_NACIONAL_B': { provider: 'ESPN', logoFormat: 'url', homeTeamFirst: true },
    'ARG_PRIMERA_DIV_B': { provider: 'ESPN', logoFormat: 'url', homeTeamFirst: true },
    'ARG_PRIMERA_DIV_C': { provider: 'ESPN', logoFormat: 'url', homeTeamFirst: true },
    'ARG_PRIMERA_DIV_D': { provider: 'ESPN', logoFormat: 'url', homeTeamFirst: true },
    'ARG_SUPERLIGA': { provider: 'ESPN', logoFormat: 'url', homeTeamFirst: true },
    'BOL_LIGA_PRO': { provider: 'ESPN', logoFormat: 'url', homeTeamFirst: true },
    'BRA_COPA': { provider: 'ESPN', logoFormat: 'url', homeTeamFirst: true },
    'BRA_CAMP_CARIOCA': { provider: 'ESPN', logoFormat: 'url', homeTeamFirst: true },
    'BRA_CAMP_GAUCHO': { provider: 'ESPN', logoFormat: 'url', homeTeamFirst: true },
    'BRA_CAMP_MINEIRO': { provider: 'ESPN', logoFormat: 'url', homeTeamFirst: true },
    'BRA_CAMP_PAULISTA': { provider: 'ESPN', logoFormat: 'url', homeTeamFirst: true },
    'BRA_SERIE_A': { provider: 'ESPN', logoFormat: 'url', homeTeamFirst: true },
    'BRA_SERIE_B': { provider: 'ESPN', logoFormat: 'url', homeTeamFirst: true },
    'BRA_SERIE_C': { provider: 'ESPN', logoFormat: 'url', homeTeamFirst: true },
    'CHI_COPA': { provider: 'ESPN', logoFormat: 'url', homeTeamFirst: true },
    'CHI_PRIMERA_DIV': { provider: 'ESPN', logoFormat: 'url', homeTeamFirst: true },
    'COL_COPA': { provider: 'ESPN', logoFormat: 'url', homeTeamFirst: true },
    'COL_PRIMERA_A': { provider: 'ESPN', logoFormat: 'url', homeTeamFirst: true },
    'COL_PRIMERA_B': { provider: 'ESPN', logoFormat: 'url', homeTeamFirst: true },
    'CONMEBOL_COPA_LIBERTADORES': { provider: 'ESPN', logoFormat: 'url', homeTeamFirst: true },
    'CONMEBOL_COPA_SUDAMERICANA': { provider: 'ESPN', logoFormat: 'url', homeTeamFirst: true },
    'ECU_PRIMERA_A': { provider: 'ESPN', logoFormat: 'url', homeTeamFirst: true },
    'PAR_PRIMERA_DIV': { provider: 'ESPN', logoFormat: 'url', homeTeamFirst: true },
    'PER_PRIMERA_PRO': { provider: 'ESPN', logoFormat: 'url', homeTeamFirst: true },
    'URU_PRIMERA_DIV': { provider: 'ESPN', logoFormat: 'url', homeTeamFirst: true },
    'VEN_PRIMERA_PRO': { provider: 'ESPN', logoFormat: 'url', homeTeamFirst: true },

    // North American Soccer
    'MLS': { provider: 'ESPN', logoFormat: 'url', homeTeamFirst: true },
    'CONCACAF_CHAMPIONS': { provider: 'ESPN', logoFormat: 'url', homeTeamFirst: true },
    'CONCACAF_LEAGUE': { provider: 'ESPN', logoFormat: 'url', homeTeamFirst: true },
    'CRC_PRIMERA_DIV': { provider: 'ESPN', logoFormat: 'url', homeTeamFirst: true },
    'GUA_LIGA_NACIONAL': { provider: 'ESPN', logoFormat: 'url', homeTeamFirst: true },
    'HON_PRIMERA_DIV': { provider: 'ESPN', logoFormat: 'url', homeTeamFirst: true },
    'JAM_PREMIER_LEAGUE': { provider: 'ESPN', logoFormat: 'url', homeTeamFirst: true },
    'MEX_ASCENSO_MX': { provider: 'ESPN', logoFormat: 'url', homeTeamFirst: true },
    'MEX_COPA_MX': { provider: 'ESPN', logoFormat: 'url', homeTeamFirst: true },
    'MEX_LIGA_BANCOMER': { provider: 'ESPN', logoFormat: 'url', homeTeamFirst: true },
    'SLV_PRIMERA_DIV': { provider: 'ESPN', logoFormat: 'url', homeTeamFirst: true },
    'USA_MLS': { provider: 'ESPN', logoFormat: 'url', homeTeamFirst: true },
    'USA_NCAA_SL_M': { provider: 'ESPN', logoFormat: 'url', homeTeamFirst: true },
    'USA_NCAA_SL_W': { provider: 'ESPN', logoFormat: 'url', homeTeamFirst: true },
    'USA_NASL': { provider: 'ESPN', logoFormat: 'url', homeTeamFirst: true },
    'NWSL': { provider: 'ESPN', logoFormat: 'url', homeTeamFirst: true },
    'USA_OPEN': { provider: 'ESPN', logoFormat: 'url', homeTeamFirst: true },
    'USA_USL': { provider: 'ESPN', logoFormat: 'url', homeTeamFirst: true },
    'NSL': { provider: 'ESPN', logoFormat: 'url', homeTeamFirst: true },
    'CPL': { provider: 'CPL', logoFormat: 'url', homeTeamFirst: true },

    // Asian Soccer
    'AFC_CHAMPIONS': { provider: 'ESPN', logoFormat: 'url', homeTeamFirst: true },
    'AUS_A_LEAGUE': { provider: 'ESPN', logoFormat: 'url', homeTeamFirst: true },
    'AUS_A_WOMEN': { provider: 'ESPN', logoFormat: 'url', homeTeamFirst: true },
    'CHN_SUPER_LEAGUE': { provider: 'ESPN', logoFormat: 'url', homeTeamFirst: true },
    'IDN_SUPER_LEAGUE': { provider: 'ESPN', logoFormat: 'url', homeTeamFirst: true },
    'IND_I_LEAGUE': { provider: 'ESPN', logoFormat: 'url', homeTeamFirst: true },
    'IND_SUPER_LEAGUE': { provider: 'ESPN', logoFormat: 'url', homeTeamFirst: true },
    'JPN_J_LEAGUE': { provider: 'ESPN', logoFormat: 'url', homeTeamFirst: true },
    'MYS_SUPER_LEAGUE': { provider: 'ESPN', logoFormat: 'url', homeTeamFirst: true },
    'SGP_PREMIER_LEAGUE': { provider: 'ESPN', logoFormat: 'url', homeTeamFirst: true },
    'THA_PREMIER_LEAGUE': { provider: 'ESPN', logoFormat: 'url', homeTeamFirst: true },

    // African Soccer
    'CAF_CHAMPIONS': { provider: 'ESPN', logoFormat: 'url', homeTeamFirst: true },
    'CAF_CONFED_CUP': { provider: 'ESPN', logoFormat: 'url', homeTeamFirst: true },
    'GHA_PREMIERE_LEAGUE': { provider: 'ESPN', logoFormat: 'url', homeTeamFirst: true },
    'KEN_PREMIERE_LEAGUE': { provider: 'ESPN', logoFormat: 'url', homeTeamFirst: true },
    'NGA_PRO_LEAGUE': { provider: 'ESPN', logoFormat: 'url', homeTeamFirst: true },
    'RSA_FIRST_DIV': { provider: 'ESPN', logoFormat: 'url', homeTeamFirst: true },
    'RSA_NEDBANK_CUP': { provider: 'ESPN', logoFormat: 'url', homeTeamFirst: true },
    'RSA_PREMIERSHIP': { provider: 'ESPN', logoFormat: 'url', homeTeamFirst: true },
    'RSA_TELKOM_KNOCKOUT': { provider: 'ESPN', logoFormat: 'url', homeTeamFirst: true },
    'UGA_SUPER_LEAGUE': { provider: 'ESPN', logoFormat: 'url', homeTeamFirst: true },
    'ZAM_SUPER_LEAGUE': { provider: 'ESPN', logoFormat: 'url', homeTeamFirst: true },
    'ZIM_PREMIER_LEAGUE': { provider: 'ESPN', logoFormat: 'url', homeTeamFirst: true },

    // Rugby
    'RUGBY': { provider: 'Scorepanel', logoFormat: 'url', homeTeamFirst: true },
    'PREMIERSHIP_RUGBY': { provider: 'ESPN', logoFormat: 'url', homeTeamFirst: true },
    'RUGBY_WORLD_CUP': { provider: 'ESPN', logoFormat: 'url', homeTeamFirst: true },
    'SIX_NATIONS': { provider: 'ESPN', logoFormat: 'url', homeTeamFirst: true },
    'THE_RUGBY_CHAMPIONSHIP': { provider: 'ESPN', logoFormat: 'url', homeTeamFirst: true },
    'EUROPEAN_RUGBY_CHAMPIONS_CUP': { provider: 'ESPN', logoFormat: 'url', homeTeamFirst: true },
    'UNITED_RUGBY_CHAMPIONSHIP': { provider: 'ESPN', logoFormat: 'url', homeTeamFirst: true },
    'SUPER_RUGBY_PACIFIC': { provider: 'ESPN', logoFormat: 'url', homeTeamFirst: true },
    'OLYMPIC_MENS_7S': { provider: 'ESPN', logoFormat: 'url', homeTeamFirst: true },
    'OLYMPIC_WOMENS_RUGBY_SEVENS': { provider: 'ESPN', logoFormat: 'url', homeTeamFirst: true },
    'INTERNATIONAL_TEST_MATCH': { provider: 'ESPN', logoFormat: 'url', homeTeamFirst: true },
    'URBA_TOP_12': { provider: 'ESPN', logoFormat: 'url', homeTeamFirst: true },
    'MITRE_10_CUP': { provider: 'ESPN', logoFormat: 'url', homeTeamFirst: true },
    'Major League Rugby': { provider: 'ESPN', logoFormat: 'url', homeTeamFirst: true },

    // Other
    'AFL': { provider: 'ESPN', logoFormat: 'url', homeTeamFirst: true },

  },

  // Define required styles.
  getStyles: function () {
    return ['MMM-MyScoreboard.css']
  },

  // Define required scripts.
  getScripts: function () {
    return ['moment.js']
  },

  gameModes: {
    FUTURE: 0,
    IN_PROGRESS: 1,
    FINAL: 2,
  },

  viewStyles: [
    'largeLogos',
    'mediumLogos',
    'smallLogos',
    'oneLine',
    'oneLineWithLogos',
    'stacked',
    'stackedWithLogos',
  ],

  localLogos: {},
  localLogosCustom: {},
  ydLoaded: {},
  noGamesToday: {},
  logoIndex: 0,

  viewStyleHasLogos: function (v) {
    switch (v) {
      case 'largeLogos':
      case 'mediumLogos':
      case 'smallLogos':
      case 'oneLineWithLogos':
      case 'stackedWithLogos':
        return true
      default:
        return false
    }
  },

  viewStyleHasRankingOverlay: function (v) {
    switch (v) {
      case 'largeLogos':
      case 'mediumLogos':
      case 'smallLogos':
        return true
      default:
        return false
    }
  },

  viewStyleHasShortcodes: function (v) {
    switch (v) {
      case 'oneLine':
      case 'oneLineWithLogos':
        return true
      default:
        return false
    }
  },

  viewStyleHasLongNames: function (v) {
    switch (v) {
      case 'stacked':
      case 'stackedWithLogos':
        return true
      default:
        return false
    }
  },

  // New Scroll Animation Function
  lastScrollPosition: 0,
  loadTime: { start: 0, end: 0 },
  separatorSpacer: 0,
  setupScrollAnimation: function (wrapper) {
    // Pull the wrapper height as it is built. If it is greater than maxHeight, trigger animation
    const prevScrollContainer = document.querySelector('.MMM-MyScoreboard .scroll-container'),
      domHeight = prevScrollContainer ? prevScrollContainer.scrollHeight : document.querySelector('.MMM-MyScoreboard .wrapper').scrollHeight
    wrapper.classList.remove('scroll')
    if (this.config.maxHeight >= domHeight) {
      return
    }
    const animationDuration = this.config.scrollSpeed * this.calculateTotalDivs()
    this.loadTime.end = Date.now()
    if (prevScrollContainer) {
      const lastTranslateY = (new DOMMatrix(window.getComputedStyle(prevScrollContainer).transform).m42) + this.lastScrollPosition - (domHeight / animationDuration * (this.loadTime.end - this.loadTime.start) / 1000)
      this.lastScrollPosition = Math.abs(lastTranslateY - this.separatorSpacer) > domHeight
        ? lastTranslateY + domHeight
        : lastTranslateY - this.separatorSpacer
    }
    let container = document.createElement('div'),
      cloneCount = Math.abs(this.lastScrollPosition) > domHeight - this.config.maxHeight ? 2 : 1
    container.className = 'scroll-container'
    container.style.setProperty('animation-duration', `${animationDuration}s`)
    while (wrapper.firstChild && !wrapper.firstChild.classList.contains('scroll-container')) {
      container.appendChild(wrapper.firstChild)
    }
    const clones = Array.from({ length: cloneCount }, () => {
      const clone = container.cloneNode(true)
      return clone
    })
    container.style.animationDuration = `${animationDuration}`
    wrapper.style.setProperty('transform', `translateY(${this.lastScrollPosition}px`)
    wrapper.classList.add('scroll') // Start animation
    wrapper.append(container, ...clones)
    this.loadTime.start = this.loadTime.end
  },

  /******************************************************************

   Function boxScoreFactory()

   Parameters:
   gameObj: Object of a single game's data

   Generates an HTML snippet representing one game in the list.
   Scores are ommitted if gameObj.gameMode == FUTURE

   <div class='box-score league [extra classes]'>
   <img class='logo home' src='logos/league/hTeamShortcode.svg' alt='hTeam' />
   <img class='logo visitor' src='logos/league/vTeamShortcode.svg' alt='vTeam' />
   <span class="team-shortcode home">XXX</span>
   <span class="team-shortcode visitor">XXX</span>
   <span class='status'>
   <span>status1</span>
   <span>status2</span>
   </span>
   <span class='score home'>hScore</span>
   <span class='score visitor'>vScore</span>
   </div>
   ******************************************************************/
  boxScoreFactory: function (league, gameObj, label) {
    var viewStyle = this.config.viewStyle

    var boxScore = document.createElement('div')
    boxScore.classList.add('box-score', league.replaceAll(' ', ''))
    boxScore.classList.add(viewStyle)
    if (gameObj.gameMode == this.gameModes.IN_PROGRESS) {
      boxScore.classList.add('in-progress')
    }
    if (gameObj.classes) {
      gameObj.classes.forEach(function (c) {
        boxScore.classList.add(c)
      })
    }
    if (this.supportedLeagues[league].homeTeamFirst) {
      boxScore.classList.add('home-team-first')
    }

    // redirect path to logos to NCAAM
    // for March Madness
    var leagueForLogoPath = league
    if (league.startsWith('NCAA')) {
      leagueForLogoPath = 'NCAA'
    }
    else if (this.supportedLeagues[label]) {
      leagueForLogoPath = label
    }

    // add team logos if applicable
    if (this.viewStyleHasLogos(viewStyle)) {
      var hTeamLogo = document.createElement('span')
      hTeamLogo.classList.add('logo', 'home')

      var hTeamLogoImg = document.createElement('img')

      if (this.localLogosCustom[leagueForLogoPath] && this.localLogosCustom[leagueForLogoPath].indexOf(gameObj.hTeam + '.svg') !== -1) {
        hTeamLogoImg.src = this.file('logos_custom/' + leagueForLogoPath + '/' + gameObj.hTeam + '.svg')
      }
      else if (this.localLogosCustom[leagueForLogoPath] && this.localLogosCustom[leagueForLogoPath].indexOf(gameObj.hTeam + '.png') !== -1) {
        hTeamLogoImg.src = this.file('logos_custom/' + leagueForLogoPath + '/' + gameObj.hTeam + '.png')
      }
      else if (this.localLogos[leagueForLogoPath] && this.localLogos[leagueForLogoPath].indexOf(gameObj.hTeam + '.svg') !== -1) {
        hTeamLogoImg.src = this.file('logos/' + leagueForLogoPath + '/' + gameObj.hTeam + '.svg')
      }
      else if (this.localLogos[leagueForLogoPath] && this.localLogos[leagueForLogoPath].indexOf(gameObj.hTeam + '.png') !== -1) {
        hTeamLogoImg.src = this.file('logos/' + leagueForLogoPath + '/' + gameObj.hTeam + '.png')
      }
      else {
        hTeamLogoImg.src = gameObj.hTeamLogoUrl
      }

      hTeamLogoImg.setAttribute('data-abbr', gameObj.hTeam)

      hTeamLogo.appendChild(hTeamLogoImg)

      if (this.config.showRankings && this.viewStyleHasRankingOverlay(viewStyle) && gameObj.hTeamRanking) {
        var hTeamRankingOverlay = document.createElement('span')
        hTeamRankingOverlay.classList.add('ranking')
        hTeamRankingOverlay.innerHTML = gameObj.hTeamRanking
        hTeamLogo.appendChild(hTeamRankingOverlay)
      }
      boxScore.appendChild(hTeamLogo)

      var vTeamLogo = document.createElement('span')
      vTeamLogo.classList.add('logo', 'visitor')

      var vTeamLogoImg = document.createElement('img')

      if (this.localLogosCustom[leagueForLogoPath] && this.localLogosCustom[leagueForLogoPath].indexOf(gameObj.vTeam + '.svg') !== -1) {
        vTeamLogoImg.src = this.file('logos_custom/' + leagueForLogoPath + '/' + gameObj.vTeam + '.svg')
      }
      else if (this.localLogosCustom[leagueForLogoPath] && this.localLogosCustom[leagueForLogoPath].indexOf(gameObj.vTeam + '.png') !== -1) {
        vTeamLogoImg.src = this.file('logos_custom/' + leagueForLogoPath + '/' + gameObj.vTeam + '.png')
      }
      else if (this.localLogos[leagueForLogoPath] && this.localLogos[leagueForLogoPath].indexOf(gameObj.vTeam + '.svg') !== -1) {
        vTeamLogoImg.src = this.file('logos/' + leagueForLogoPath + '/' + gameObj.vTeam + '.svg')
      }
      else if (this.localLogos[leagueForLogoPath] && this.localLogos[leagueForLogoPath].indexOf(gameObj.vTeam + '.png') !== -1) {
        vTeamLogoImg.src = this.file('logos/' + leagueForLogoPath + '/' + gameObj.vTeam + '.png')
      }
      else {
        vTeamLogoImg.src = gameObj.vTeamLogoUrl
      }

      vTeamLogoImg.setAttribute('data-abbr', gameObj.vTeam)

      vTeamLogo.appendChild(vTeamLogoImg)

      if (this.config.showRankings && this.viewStyleHasRankingOverlay(viewStyle) && gameObj.vTeamRanking) {
        var vTeamRankingOverlay = document.createElement('span')
        vTeamRankingOverlay.classList.add('ranking')
        vTeamRankingOverlay.innerHTML = gameObj.vTeamRanking
        vTeamLogo.appendChild(vTeamRankingOverlay)
      }
      boxScore.appendChild(vTeamLogo)
    }

    // add team shortcodes if applicable
    if (this.viewStyleHasShortcodes(viewStyle)) {
      var hTeamSC = document.createElement('span')
      hTeamSC.classList.add('team-short-code', 'home')
      hTeamSC.innerHTML = (this.config.showRankings && gameObj.hTeamRanking ? '<span class="ranking">' + gameObj.hTeamRanking + '</span>' : '') + gameObj.hTeam
      boxScore.appendChild(hTeamSC)

      var vTeamSC = document.createElement('span')
      vTeamSC.classList.add('team-short-code', 'visitor')
      vTeamSC.innerHTML = (this.config.showRankings && gameObj.vTeamRanking ? '<span class="ranking">' + gameObj.vTeamRanking + '</span>' : '') + gameObj.vTeam
      boxScore.appendChild(vTeamSC)
    }

    // add team names if applicable
    if (this.viewStyleHasLongNames(viewStyle)) {
      var hTeamName = document.createElement('span')
      hTeamName.classList.add('team-name', 'home')
      hTeamName.innerHTML = (this.config.showRankings && gameObj.hTeamRanking ? '<span class="ranking">' + gameObj.hTeamRanking + '</span>' : '') + gameObj.hTeamLong
      boxScore.appendChild(hTeamName)

      var vTeamName = document.createElement('span')
      vTeamName.classList.add('team-name', 'visitor')
      vTeamName.innerHTML = (this.config.showRankings && gameObj.vTeamRanking ? '<span class="ranking">' + gameObj.vTeamRanking + '</span>' : '') + gameObj.vTeamLong
      boxScore.appendChild(vTeamName)
    }

    // add "@" for games not yet started for the oneLine
    // and oneLineWithLogos view styles
    if (gameObj.gameMode == this.gameModes.FUTURE
      && (viewStyle == 'oneLine' || viewStyle == 'oneLineWithLogos')) {
      var vsSymbol = document.createElement('span')
      vsSymbol.classList.add('vs-symbol')
      // Soccer games we don't say AT (@) but VS thus the HOME team is first (Chelsea Vs Manchester - Chelsea's Home instead of Manchester @ Chelsea)
      if (this.supportedLeagues[league].homeTeamFirst) {
        vsSymbol.innerHTML = 'vs'
      }
      else {
        vsSymbol.innerHTML = '@'
      }
      boxScore.appendChild(vsSymbol)
    }

    // add game status
    var status = document.createElement('div')
    status.classList.add('status')
    gameObj.status.forEach(function (s) {
      var statusPart = document.createElement('div')
      statusPart.innerHTML = s
      statusPart.classList.add('statusPart')
      status.appendChild(statusPart)
    })
    /*     if (['smallLogos', 'oneLine', 'oneLineWithLogos'].includes(this.config.viewStyle)) {
      var maxBroadcasts = Math.min(1, gameObj.broadcast.length, this.config.limitBroadcasts)
    }
    else if (['largeLogos', 'stacked', 'stackedWithLogos'].includes(this.config.viewStyle)) {
      maxBroadcasts = Math.min(2, gameObj.broadcast.length, this.config.limitBroadcasts)
    }
    else {
      maxBroadcasts = Math.min(gameObj.broadcast.length, this.config.limitBroadcasts)
     } */
    // maxBroadcasts = gameObj.broadcast.length
    var broadcastPart = document.createElement('div')
    broadcastPart.classList.add('broadcast')
    /*     if (gameObj.broadcast.length === 1) {
      broadcastPart.innerHTML += gameObj.broadcast[0]
    } */
    /*     else if (maxBroadcasts === 1) {
      broadcastPart.innerHTML += gameObj.broadcast[Math.floor(Math.random() * gameObj.broadcast.length)]
    } */
    // else {
    if (gameObj.broadcast != null) {
      for (var i = 0; i < gameObj.broadcast.length; i++) {
        // broadcastPart.innerHTML += gameObj.broadcast[i]
        var broadcastPartDiv = document.createElement('div')
        broadcastPartDiv.classList.add('broadcastIconDiv')
        broadcastPartDiv.innerHTML += gameObj.broadcast[i]
        broadcastPart.appendChild(broadcastPartDiv)
      }
    }
    // }
    /* if (gameObj.broadcast.length > 1) {
      broadcastPart.innerHTML += `<span class="moreBroadcasts">+${gameObj.broadcast.length - 1}</span>`
    } */
    status.appendChild(broadcastPart)
    boxScore.appendChild(status)

    // add scores if game in progress or finished
    if (gameObj.gameMode != this.gameModes.FUTURE) {
      var hTeamScore = document.createElement('span')
      hTeamScore.classList.add('score', 'home')
      hTeamScore.innerHTML = (gameObj.hScore)
      boxScore.appendChild(hTeamScore)

      var vTeamScore = document.createElement('span')
      vTeamScore.classList.add('score', 'visitor')
      vTeamScore.innerHTML = (gameObj.vScore)
      boxScore.appendChild(vTeamScore)
    }

    // add classes to final games
    if (gameObj.gameMode == this.gameModes.FINAL) {
      boxScore.classList.add('final')
      if (gameObj.hScore > gameObj.vScore) {
        boxScore.classList.add('winner-h')
      }
      else if (gameObj.vScore > gameObj.hScore) {
        boxScore.classList.add('winner-v')
      }
      else {
        boxScore.classList.add('tie')
      }
    }

    if (this.config.showPlayoffStatus && gameObj.playoffStatus !== '' && gameObj.playoffStatus !== undefined) {
      var playoffStatus = document.createElement('div')
      playoffStatus.classList.add('xsmall', 'dimmed', 'playoffStatus')
      playoffStatus.innerHTML = gameObj.playoffStatus
      boxScore.appendChild(playoffStatus)
      boxScore.classList.add('playoff')
    }

    return boxScore
  },

  // Override dom generator.
  getDom: function () {
    var wrapper = document.createElement('div')
    wrapper.classList.add('wrapper')

    /*
      Set up basic classes
    */
    if (this.config.colored) {
      wrapper.classList.add('colored')
    }
    if (this.config.shadeRows) {
      wrapper.classList.add('shade-rows')
    }
    if (!this.config.showLeagueSeparators) {
      wrapper.classList.add('no-league-separators')
    }
    if (this.config.highlightWinners) {
      wrapper.classList.add('highlight-winners')
    }

    /*
      Show "Loading" when there's no data initially.
    */
    if (!this.loaded) {
      var loadingText = document.createElement('div')
      loadingText.innerHTML = this.translate('Loading MMM-MyScoreboard...')
      loadingText.className = 'dimmed light small'
      wrapper.appendChild(loadingText)
      return wrapper
    }

    // New property to set wrapper height for animations
    if (this.config.maxHeight < 10000) {
      wrapper.style.setProperty('max-height', `${this.config.maxHeight}px`)
    }

    /*
      Run through the leagues and generate box score displays for
      each game.
    */
    // var anyGames = false
    var self = this

    /* this.config.sports.forEach(function (sport) {
      var leagueSeparator = []
      if (self.sportsData[sport.league] != null && self.sportsData[sport.league].length > 0) {
        // anyGames = true
        if (self.config.showLeagueSeparators) {
          leagueSeparator = document.createElement('div')
          leagueSeparator.classList.add('league-separator')
          if (sport.label) {
            leagueSeparator.innerHTML = '<span>' + sport.label + '</span>'
          }
          else {
            leagueSeparator.innerHTML = '<span>' + sport.league + '</span>'
          }
          wrapper.appendChild(leagueSeparator)
        }
        self.sportsData[sport.league].forEach(function (game, gidx) {
          var boxScore = self.boxScoreFactory(sport.league, game)
          boxScore.classList.add(gidx % 2 == 0 ? 'odd' : 'even')
          wrapper.appendChild(boxScore)
        })
      }
      if (self.sportsDataYd[sport.league] != null && self.sportsDataYd[sport.league].length > 0) {
        // anyGames = true
        if (self.config.showLeagueSeparators) {
          leagueSeparator = document.createElement('div')
          leagueSeparator.classList.add('league-separator')
          if (sport.label) {
            leagueSeparator.innerHTML = '<span>' + sport.label + ' - Yesterday</span>'
          }
          else {
            leagueSeparator.innerHTML = '<span>' + sport.league + ' - Yesterday</span>'
          }
          wrapper.appendChild(leagueSeparator)
        }
        self.sportsDataYd[sport.league].forEach(function (game, gidx) {
          var boxScore = self.boxScoreFactory(sport.league, game)
          boxScore.classList.add(gidx % 2 == 0 ? 'odd' : 'even')
          wrapper.appendChild(boxScore)
        })
      }
    }) */
    // this.config.sports.forEach(function (sport) {
    // Log.debug(self.sportsData['NHL'])

    self.sportsData = this.sortDict(self.sportsData)
    for (const [sport, scores] of Object.entries(self.sportsData)) {
      var leagueSeparator = []
      if (scores['scores'].length > 0) {
        // anyGames = true
        if (self.config.showLeagueSeparators) {
          leagueSeparator = document.createElement('div')
          leagueSeparator.classList.add('league-separator')
          leagueSeparator.innerHTML = '<span>' + sport + '</span>'
          wrapper.appendChild(leagueSeparator)
        }
        scores['scores'].forEach(function (game, gidx) {
          var boxScore = self.boxScoreFactory(scores['league'], game, sport)
          boxScore.classList.add(gidx % 2 == 0 ? 'odd' : 'even')
          wrapper.appendChild(boxScore)
        })
      }
      if (self.sportsDataYd[sport] && self.sportsDataYd[sport]['scores'].length > 0) {
        // anyGames = true
        if (self.config.showLeagueSeparators) {
          leagueSeparator = document.createElement('div')
          leagueSeparator.classList.add('league-separator')
          leagueSeparator.innerHTML = '<span>' + sport + ' - Yesterday</span>'
          wrapper.appendChild(leagueSeparator)
        }
        self.sportsDataYd[sport]['scores'].forEach(function (game, gidx) {
          var boxScore = self.boxScoreFactory(scores['league'], game, sport)
          boxScore.classList.add(gidx % 2 == 0 ? 'odd' : 'even')
          wrapper.appendChild(boxScore)
        })
      }
    }

    self.sportsDataYd = this.sortDict(self.sportsDataYd)
    for (const [sport, scores] of Object.entries(self.sportsDataYd)) {
      leagueSeparator = []
      if (scores['scores'].length > 0 && !self.sportsData[sport]) {
        // anyGames = true
        if (self.config.showLeagueSeparators) {
          leagueSeparator = document.createElement('div')
          leagueSeparator.classList.add('league-separator')
          leagueSeparator.innerHTML = '<span>' + sport + ' - Yesterday</span>'
          wrapper.appendChild(leagueSeparator)
        }
        scores['scores'].forEach(function (game, gidx) {
          var boxScore = self.boxScoreFactory(scores['league'], game, sport)
          boxScore.classList.add(gidx % 2 == 0 ? 'odd' : 'even')
          wrapper.appendChild(boxScore)
        })
      }
    }

    /*
      We're using the lockString parameter to play nicely with
      other modules that attempt to show or hide this module,
      e.g.: MMM-Facial-Recognition.  When both use a lockString,
      the module will only be visible when both agree that it
      should be visible.
    */
    // Removed because it was throwing errors in the console
    // if (!anyGames) {
    //  this.hide(1000, {lockString: this.identifier});
    // } else {
    //  this.show(1000, {lockString: this.identifier});
    // }

    if (self.config.maxHeight < 10000) {
      self.setupScrollAnimation(wrapper)
    }; // Trigger animation check

    return wrapper
  },

  // Function to Calculate the Total number of Divs for scoll and update interval.
  calculateTotalDivs: function () {
    // separatorDivs can be used to slow animation down when active if desired.
    let gameDivs = 0
    // let separatorDivs = 0;
    // Log.debug(Object.keys(this.sportsData))
    Object.keys(this.sportsData).forEach((sport) => {
      gameDivs += this.sportsData[sport]['scores'].length
      // if (this.config.showLeagueSeparators) separatorDivs++;
    })
    Object.keys(this.sportsDataYd).forEach((sport) => {
      gameDivs += this.sportsDataYd[sport]['scores'].length
      // if (this.config.showLeagueSeparators) separatorDivs++;
    })
    // return (gameDivs + separatorDivs);
    return gameDivs
  },

  socketNotificationReceived: function (notification, payload) {
    if (notification === 'MMM-MYSCOREBOARD-SCORE-UPDATE' && payload.instanceId == this.identifier) {
      // Log.info('[MMM-MyScoreboard] Updating Scores')
      this.loaded = true
      this.sportsData[payload.label] = {}
      this.sportsData[payload.label]['scores'] = payload.scores
      this.sportsData[payload.label]['league'] = payload.index
      this.sportsData[payload.label]['sortIdx'] = payload.sortIdx
      this.updateDom()
      if (payload.noGamesToday === true) {
        this.noGamesToday[payload.index] = moment().add(this.config.debugHours, 'hours').add(this.config.debugMinutes, 'minutes').format('YYYY-MM-DD')
      }
      if (moment().add(this.config.debugHours, 'hours').add(this.config.debugMinutes, 'minutes').hour() >= this.config.rolloverHours) {
        this.sportsDataYd = {}
      }
    }
    else if (notification === 'MMM-MYSCOREBOARD-SCORE-UPDATE-YD' && payload.instanceId == this.identifier) {
      // Log.info('[MMM-MyScoreboard] Updating Yesterday\'s Scores')
      this.loaded = true
      this.sportsDataYd[payload.label] = {}
      this.sportsDataYd[payload.label]['scores'] = payload.scores
      this.sportsDataYd[payload.label]['league'] = payload.index
      this.sportsDataYd[payload.label]['sortIdx'] = payload.sortIdx
      this.updateDom()
      var stopGrabbingYD = true
      for (let i = 0; i < payload.scores.length; i++) {
        if (payload.scores[i].gameMode < 2) {
          stopGrabbingYD = false
        }
      }
      this.ydLoaded[payload.index] = { loaded: stopGrabbingYD, date: moment().add(this.config.debugHours, 'hours').add(this.config.debugMinutes, 'minutes').format('YYYY-MM-DD') }
    }
    else if (notification === 'MMM-MYSCOREBOARD-LOCAL-LOGO-LIST' && payload.instanceId == this.identifier) {
      this.localLogos = payload.logos
      this.localLogosCustom = payload.logosCustom

      /*
        get scores and set up polling
      */

      this.getScores()

      /*
        As of v2.0, poll interval is no longer configurable.
        Providers manage their own data pull schedule in some
        cases (e.g. SNET.js), while others will poll on demand
        when this timer fires. In an effort to keep the APIs
        free and clear, please do not modify this to hammer
        the APIs with a flood of calls.  Doing so may cause the
        respective feed owners to lock down the APIs. Updating
        every two minutes should be more than fine for our purposes.
      */
      var self = this
      setInterval(function () {
        self.getScores()
      }, 2 * 60 * 1000)
    }
  },

  start: function () {
    Log.info('Starting module: ' + this.name)

    /*
      scrub the config to ensure only supported leagues are included
    */
    var scrubbedSports = []
    var self = this

    this.config.sports.forEach(function (sport) {
      if (self.supportedLeagues[sport.league]) {
        scrubbedSports.push(sport)
      }
      else if (self.legacySoccer[sport.league]) {
        // Log.debug(self.legacySoccer[sport.league])
        sport.league = self.legacySoccer[sport.league]
        scrubbedSports.push(sport)
        // Log.debug(sport)
      }
      else {
        Log.warn(`[MMM-MyScoreboard] League ${sport.league} is not a valid league name`)
      }
    })
    this.config.sports = scrubbedSports
    this.separatorSpacer = this.config.showLeagueSeparators ? 10 : 0

    /*
      initialize variables
    */

    this.loaded = false
    this.sportsData = {}
    this.sportsDataYd = {}

    if (this.viewStyles.indexOf(this.config.viewStyle) == -1) {
      this.config.viewStyle = 'largeLogos'
    }

    /*
      Get list of local logo images files.
      These will override the URL provided by the feed

      Once this returns the list, we'll start polling for data
    */

    this.sendSocketNotification('MMM-MYSCOREBOARD-GET-LOCAL-LOGOS', { instanceId: this.identifier })

    // Schedule the first logo rotation
    this.rotateChannels()

    // Schedule the UI load based on normal interval
    // var self = this
    setInterval(function () {
      self.rotateChannels()
    }, this.config.channelRotateInterval)
  },

  makeTeamList: function (inst, league, teams, groups) {
    var teamList = []

    if (teams != null) {
      teamList = teams
    }

    if (groups != null) {
      for (var i = 0; i < groups.length; i++) {
        var group = inst.groups[league][groups[i]]
        if (group != null) {
          group.forEach(function (team) {
            teamList.push(team)
          })
        }
      }
    }

    if (teamList.length == 0) {
      return null
    }
    return teamList
  },

  getScores: function () {
    var gameDate = moment().add(this.config.debugHours, 'hours').add(this.config.debugMinutes, 'minutes') // get today's date
    var whichDay = { today: false, yesterday: 'no' }

    if (gameDate.hour() < this.config.rolloverHours) {
      var tempYesterday = 'yes'
    }

    if (gameDate.hour() >= this.config.rolloverHours) {
      var tempToday = true
      // tempYesterday = 'erase'
    }
    else if (this.config.alwaysShowToday) {
      tempToday = true
    }

    // just used for debug, if you want to force a specific date
    if (this.config.DEBUG_gameDate) {
      gameDate = moment(this.config.DEBUG_gameDate, 'YYYYMMDD')
    }

    var self = this
    if (self.config.debugHours > 0 || self.config.debugMinutes > 0) {
      Log.debug(`[MMM-MyScoreboard] ${gameDate}`)
    }
    self.loadTime.start = Date.now()
    this.config.sports.forEach(function (sport, index) {
      if (self.noGamesToday[sport.league] === gameDate.format('YYYY-MM-DD')) {
        whichDay.today = false
      }
      else {
        whichDay.today = tempToday
      }

      if (self.ydLoaded[sport.league] && self.ydLoaded[sport.league]['loaded'] && self.ydLoaded[sport.league]['date'] === gameDate.format('YYYY-MM-DD')) {
        whichDay.yesterday = false
      }
      else {
        whichDay.yesterday = tempYesterday
      }
      if (sport.label) {
        var thisLabel = sport.label
      }
      else {
        thisLabel = sport.league
      }
      var payload = {
        instanceId: self.identifier,
        index: index,
        league: sport.league,
        teams: self.makeTeamList(self, sport.league, sport.teams, sport.groups),
        provider: self.supportedLeagues[sport.league].provider,
        label: thisLabel,
        gameDate: gameDate,
        whichDay: whichDay,
        hideBroadcasts: self.config.hideBroadcasts,
        skipChannels: self.config.skipChannels,
        showLocalBroadcasts: self.config.showLocalBroadcasts,
        displayLocalChannels: self.config.displayLocalChannels,
        localMarkets: self.config.localMarkets,
        debugHours: self.config.debugHours,
        debugMinutes: self.config.debugMinutes,
      }

      self.sendSocketNotification('MMM-MYSCOREBOARD-GET-SCORES', payload)
    })
  },

  rotateChannels: function () {
    // Log.debug(`${this.logoIndex} <- logoIndex1`)
    let broadcastDivs = document.getElementsByClassName('broadcast')
    for (let j = 0; j < broadcastDivs.length; j++) {
      let logos = document.getElementsByClassName('broadcast')[j].getElementsByClassName('broadcastIconDiv')

      for (let i = 0; i < logos.length; i++) {
        logos[i].style.display = 'none'
      }
      if (logos.length > 0) {
        // Log.debug(`${this.logoIndex} <- logoIndex2`)
        logos[(this.logoIndex) % logos.length].style.display = 'flex'
        // logos[0].style.display = "block"
        // logos[moment().unix() % logos.length].style.display = "block"
      }
    }
    // Log.debug(`${this.logoIndex} <- logoIndex3`)
    this.logoIndex++
    // Log.debug(`${this.logoIndex} <- logoIndex4`)
    if (this.logoIndex === 17280) {
      this.logoIndex = 0
    }
    // Log.debug(`${this.logoIndex} <- logoIndex5`)
    /* setTimeout(self.rotateChannels, 5000); // Change image every 5 seconds */
  },

  sortDict: function (dict) {
    // Create items array
    var items = Object.keys(dict).map(function (key) {
      return [key, dict[key]]
    })
    // Sort the array based on the second element
    items.sort(function (first, second) {
      return first[1]['sortIdx'] - second[1]['sortIdx']
    })

    var sortedDict = {}
    for (let i = 0; i < items.length; i++) {
      sortedDict[items[i][0]] = items[i][1]
    }
    return sortedDict
  },

  /*
    This section is for convenience when setting up your configuration.
    If you care only about a certain division in a particular sport,
    you can specify its group name as a shortcut rather than adding
    indiviual teams. This becomes espcially useful for leagues like
    NCAAF and NCAAM where there are hundreds of teams.
  */
  groups: {
    NHL: {

      // divisions
      Atlantic: ['BOS', 'BUF', 'DET', 'FLA', 'MTL', 'OTT', 'TB', 'TOR'],
      Metropolitain: ['CAR', 'CLB', 'NJ', 'NYI', 'NYR', 'PIT', 'PHI', 'WSH'],
      Central: ['ARI', 'CHI', 'COL', 'DAL', 'MIN', 'NSH', 'STL', 'WPG'],
      Pacific: ['ANA', 'CGY', 'EDM', 'LA', 'SEA', 'SJ', 'UTA', 'VAN', 'VGK'],

      // conferences
      East: ['BOS', 'BUF', 'CAR', 'CLB', 'DET', 'FLA', 'MTL', 'NJ', 'NYI', 'NYR', 'PIT', 'PHI', 'OTT', 'TB', 'TOR', 'WSH'],
      West: ['ANA', 'ARI', 'CGY', 'CHI', 'COL', 'DAL', 'EDM', 'LA', 'MIN', 'NSH', 'SEA', 'SJ', 'STL', 'VAN', 'VGK', 'WPG'],

      // all Canadian teams
      Canadian: ['CGY', 'EDM', 'MTL', 'OTT', 'TOR', 'VAN', 'WPG'],
    },

    MLB: {

      // divisions
      'AL East': ['BAL', 'BOS', 'NYY', 'TB', 'TOR'],
      'AL Central': ['CLE', 'CWS', 'DET', 'KC', 'MIN'],
      'AL West': ['HOU', 'LAA', 'ATH', 'SEA', 'TEX'],
      'NL East': ['ATL', 'MIA', 'NYM', 'PHI', 'WSH'],
      'NL Central': ['CHC', 'CIN', 'MIL', 'PIT', 'STL'],
      'NL West': ['AZ', 'COL', 'LAD', 'SD', 'SF'],

      // leagues
      'American League': ['BAL', 'BOS', 'CLE', 'CWS', 'DET', 'HOU', 'LAA', 'KC', 'MIN', 'NYY', 'ATH', 'SEA', 'TB', 'TEX', 'TOR'],
      'National League': ['AZ', 'ATL', 'CHC', 'CIN', 'COL', 'LAD', 'MIA', 'MIL', 'NYM', 'PHI', 'PIT', 'SD', 'SF', 'STL', 'WSH'],

    },

    NBA: {

      // divisions
      Atlantic: ['BKN', 'BOS', 'NY', 'PHI', 'TOR'],
      Central: ['CHI', 'CLE', 'DET', 'IND', 'MIL'],
      Southeast: ['ATL', 'CHA', 'MIA', 'ORL', 'WSH'],
      Northwest: ['DEN', 'MIN', 'OKC', 'POR', 'UTAH'],
      Pacific: ['GS', 'LAC', 'LAL', 'PHX', 'SAC'],
      Southwest: ['DAL', 'HOU', 'MEM', 'NO', 'SA'],

      // conferences
      East: ['ATL', 'BKN', 'BOS', 'CHA', 'CHI', 'CLE', 'DET', 'IND', 'MIA', 'MIL', 'NY', 'ORL', 'PHI', 'TOR', 'WSH'],
      West: ['DAL', 'DEN', 'GS', 'HOU', 'LAC', 'LAL', 'MEM', 'MIN', 'NO', 'OKC', 'PHX', 'POR', 'SA', 'SAC', 'UTAH'],

    },

    WNBA: {

      // conferences
      East: ['ATL', 'CHI', 'CONN', 'IND', 'NY', 'WSH'],
      West: ['DAL', 'LA', 'LV', 'MIN', 'PHX', 'SEA'],

    },

    NFL: {

      // divisions
      'AFC East': ['NE', 'BUF', 'MIA', 'NYJ'],
      'AFC North': ['BAL', 'CIN', 'CLE', 'PIT'],
      'AFC South': ['JAX', 'HOU', 'IND', 'TEN'],
      'AFC West': ['DEN', 'KC', 'LAC', 'LV'],
      'NFC East': ['DAL', 'NYG', 'PHI', 'WAS'],
      'NFC North': ['CHI', 'DET', 'GB', 'MIN'],
      'NFC South': ['ATL', 'CAR', 'NO', 'TB'],
      'NFC West': ['ARI', 'LA', 'SEA', 'SF'],

      // conferences
      'AFC': ['BAL', 'BUF', 'CIN', 'CLE', 'DEN', 'HOU', 'IND', 'JAX', 'KC', 'LAC', 'MIA', 'NE', 'NYJ', 'LV', 'PIT', 'TEN'],
      'NFC': ['ARI', 'ATL', 'CAR', 'CHI', 'DAL', 'DET', 'GB', 'LA', 'MIN', 'NO', 'NYG', 'PHI', 'SEA', 'SF', 'TB', 'WAS'],
    },

    MLS: {

      // conferences
      East: ['ATL', 'CHI', 'CIN', 'CLT', 'CLB', 'DC', 'MIA', 'MTL', 'NY', 'NYC', 'NE', 'NSH', 'ORL', 'PHI', 'TOR'],
      West: ['ATX', 'COL', 'DAL', 'HOU', 'SKC', 'LA', 'LAFC', 'MIN', 'POR', 'RSL', 'SEA', 'SD', 'SJ', 'STL', 'VAN'],

    },

    CFL: {

      // conferences
      East: ['HAM', 'MTL', 'OTT', 'TOR'],
      West: ['BC', 'CGY', 'EDM', 'SSK', 'WPG'],

    },

    NCAAF: {

      // divisions
      'American Athletic': ['ARMY', 'CHAR', 'ECU', 'FAU', 'MEM', 'NAVY', 'RICE', 'TEM', 'TULN', 'TLSA', 'UAB', 'UNT', 'USF', 'UTSA'],
      'ACC': ['BC', 'CAL', 'CLEM', 'DUKE', 'FSU', 'GT', 'LOU', 'MIAMI', 'NCST', 'PITT', 'SMU', 'STAN', 'SYR', 'UNC', 'UVA', 'VT', 'WAKE'],
      'Big 12': ['ARIZ', 'ASU', 'BAY', 'BYU', 'CIN', 'COLO', 'HOU', 'ISU', 'KU', 'KSU', 'OKST', 'TCU', 'TTU', 'UCF', 'UTAH', 'WVU'],
      'Big Ten': ['ILL', 'IND', 'IOWA', 'MD', 'MICH', 'MSU', 'MINN', 'NEB', 'NW', 'OSU', 'ORE', 'PSU', 'PUR', 'RUTG', 'UCLA', 'USC', 'WASH', 'WIS'],
      'Conference USA': ['DEL', 'FIU', 'JVST', 'KENN', 'LIB', 'LT', 'MOST', 'MTSU', 'NMSU', 'SHSU', 'UTEP', 'WKU'],
      'FBS Independents': ['CONN', 'ND'],
      'Mid-American': ['AKR', 'BALL', 'BGSU', 'BUFF', 'CMU', 'EMU', 'KENT', 'M-OH', 'NIU', 'OHIO', 'TOL', 'UMASS', 'WMU'],
      'Mountain West': ['AFA', 'BSU', 'CSU', 'FRES', 'HAW', 'NEV', 'SDSU', 'SJSU', 'UNLV', 'UNM', 'USU', 'WYO'],
      'Pac-12': ['ORST', 'WSU'],
      'SEC': ['ALA', 'ARK', 'AUB', 'FLA', 'UGA', 'UK', 'LSU', 'MISS', 'MSST', 'MIZ', 'OKLA', 'SC', 'TENN', 'TA&M', 'TEX', 'VAN'],
      'Sun Belt': ['APP', 'ARST', 'CCU', 'GASO', 'GAST', 'JMU', 'MRSH', 'ODU', 'ULL', 'ULM', 'USA', 'USM', 'TXST', 'TROY'],
      'Top 25': ['@T25'], // special indicator for Top 25 ranked teams

    },

    NCAAM: {

      // divisions
      'America East': ['ALBY', 'BING', 'BRY', 'MAINE', 'NJIT', 'UML', 'UMBC', 'UNH', 'UVM'],
      'American': ['CHAR', 'ECU', 'FAU', 'MEM', 'RICE', 'TEM', 'TULN', 'TLSA', 'UAB', 'UNT', 'USF', 'UTSA', 'WICH'],
      'Atlantic 10': ['DAV', 'DAY', 'DUQ', 'FOR', 'GMU', 'GW', 'LAS', 'L-IL', 'RICH', 'JOES', 'SLU', 'SBON', 'URI', 'VCU'],
      'ACC': ['BC', 'CAL', 'CLEM', 'DUKE', 'FSU', 'GT', 'LOU', 'MIAMI', 'NCST', 'ND', 'PITT', 'SMU', 'STAN', 'SYR', 'UNC', 'UVA', 'VT', 'WAKE'],
      'Atlantic Sun': ['BELL', 'UCA', 'EKY', 'FGCU', 'JAC', 'LIP', 'PEAY', 'QUOC', 'UNA', 'UNF', 'UWG', 'STET'],
      'Big 12': ['ARIZ', 'ASU', 'BAY', 'BYU', 'CIN', 'COLO', 'HOU', 'ISU', 'KU', 'KSU', 'OKST', 'TCU', 'TTU', 'UCF', 'UTAH', 'WVU'],
      'Big East': ['BUT', 'CONN', 'CREI', 'DEP', 'GTWN', 'MARQ', 'PROV', 'HALL', 'SJU', 'VILL', 'XAV'],
      'Big Sky': ['EWU', 'IDHO', 'IDST', 'MONT', 'MTST', 'NAU', 'PRST', 'SAC', 'UNCO', 'WEB'],
      'Big South': ['CHSO', 'WEBB', 'HP', 'LONG', 'PRE', 'RAD', 'UNCA', 'UPST', 'WIN'],
      'Big Ten': ['ILL', 'IND', 'IOWA', 'MD', 'MICH', 'MSU', 'MINN', 'NEB', 'NW', 'OSU', 'ORE', 'PSU', 'PUR', 'RUTG', 'UCLA', 'USC', 'WASH', 'WIS'],
      'Big West': ['CP', 'CSB', 'CSF', 'CSUN', 'HAW', 'LBSU', 'UCD', 'UCI', 'UCRV', 'UCSB', 'UCSD'],
      'Coastal': ['CAM', 'COFC', 'DREX', 'ELON', 'HAMP', 'HOF', 'MONM', 'NCAT', 'NE', 'STON', 'TOWS', 'UNCW', 'WM'],
      'Conference USA': ['DEL', 'FIU', 'JVST', 'KENN', 'LIB', 'LT', 'MOST', 'MTU', 'NMSU', 'SHSU', 'UTSA', 'WKU'],
      'Horizon': ['CLEV', 'DET', 'GB', 'IUPU', 'IPFW', 'MILW', 'NKU', 'OAK', 'RMU', 'WRST', 'YSU'],
      'Ivy': ['BRWN', 'CLMB', 'COR', 'DART', 'HARV', 'PENN', 'PRIN', 'YALE'],
      'MAAC': ['CAN', 'FAIR', 'IONA', 'MAN', 'MRMK', 'MRST', 'MSM', 'NIAG', 'QUIN', 'RID', 'SHU', 'SPU', 'SIE'],
      'Mid-American': ['AKR', 'BALL', 'BGSU', 'BUFF', 'CMU', 'EMU', 'KENT', 'UMASS', 'M-OH', 'NIU', 'OHIO', 'TOL', 'WMU'],
      'MEAC': ['COPP', 'DSU', 'HOW', 'MORG', 'NSU', 'NCCU', 'SCST', 'UMES'],
      'Missouri Valley': ['BEL', 'BRAD', 'DRKE', 'EVAN', 'ILST', 'INST', 'MURR', 'UIC', 'UNI', 'SIU', 'VALP'],
      'Mountain West': ['AFA', 'BSU', 'CSU', 'FRES', 'GCU', 'NEV', 'UNM', 'SDSU', 'SJSU', 'UNLV', 'USU', 'WYO'],
      'Northeast': ['CCSU', 'CHS', 'FDU', 'LIU', 'SFU', 'STO', 'WAG'],
      'Ohio Valley': ['EIU', 'LIN', 'MORE', 'SEMO', 'SIUE', 'TNST', 'TNTC', 'UALR', 'USI', 'UTM', 'WIU'],
      'Patriot League': ['AMER', 'ARMY', 'BU', 'BUCK', 'COLG', 'HC', 'LAF', 'LEH', 'L-MD', 'NAVY'],
      'SEC': ['ALA', 'ARK', 'AUB', 'FLA', 'UGA', 'UK', 'LSU', 'MISS', 'MSST', 'MIZ', 'OKLA', 'SC', 'TENN', 'TA&M', 'TEX', 'VAN'],
      'Southern': ['CHAT', 'ETSU', 'FUR', 'MER', 'SAM', 'CIT', 'UNCG', 'VMI', 'WCU', 'WOF'],
      'Southland': ['AMCC', 'HCU', 'IW', 'LAM', 'MCNS', 'NICH', 'NWST', 'SELA', 'SFA', 'TRGV', 'UNO'],
      'SWAC': ['AAMU', 'ALST', 'ALCN', 'BCU', 'FAMU', 'GRAM', 'JKST', 'MVSU', 'PV', 'SOU', 'TXSO', 'UAPB'],
      'Summit League': ['DEN', 'NDSU', 'OMA', 'ORU', 'SDAK', 'SDST', 'STMN', 'UMKC', 'UND'],
      'Sun Belt': ['APP', 'ARST', 'CCAR', 'GASO', 'GAST', 'JMU', 'MRSH', 'ODU', 'TXST', 'TROY', 'ULL', 'ULM', 'USA', 'USM'],
      'West Coast': ['GONZ', 'LMU', 'ORST', 'PAC', 'PEPP', 'PORT', 'SMC', 'USD', 'SF', 'SCU', 'SEA', 'WSU'],
      'WAC': ['ACU', 'CBU', 'SUU', 'TAR', 'UTA', 'UTU', 'UVU'],
      'Top 25': ['@T25'], // special indicator for Top 25 ranked teams

    },

    NCAAW: {

      // divisions
      'ASUN': ['APSU', 'BELL', 'CARK', 'EKU', 'FGCU', 'JAX', 'LIP', 'UNA', 'UNF', 'QUOC', 'STET'],
      'America East': ['ALB', 'BING', 'BRY', 'MAINE', 'NJIT', 'UNH', 'UMBC', 'UML', 'UVM'],
      'American': ['CHAR', 'ECU', 'FAU', 'MEM', 'RICE', 'TEM', 'TULN', 'TLSA', 'UAB', 'UNT', 'USF', 'UTSA', 'WICH'],
      'Atlantic 10': ['DAV', 'DAY', 'DUQ', 'FOR', 'GMU', 'GW', 'LAS', 'LUC', 'URI', 'RICH', 'JOES', 'SLU', 'SBU', 'MASS', 'VCU'],
      'ACC': ['BC', 'CAL', 'CLEM', 'DUKE', 'FSU', 'GT', 'LOU', 'MIAMI', 'NCST', 'ND', 'PITT', 'SMU', 'STAN', 'SYR', 'UNC', 'UVA', 'VT', 'WAKE'],
      'Big 12': ['ARIZ', 'ASU', 'BAY', 'BYU', 'CIN', 'COLO', 'HOU', 'ISU', 'KU', 'KSU', 'OKST', 'TCU', 'TTU', 'UCF', 'UTAH', 'WVU'],
      'Big East': ['BUT', 'CREI', 'DEP', 'GTWN', 'MARQ', 'PROV', 'HALL', 'SJU', 'CONN', 'VILL', 'XAV'],
      'Big Sky': ['EWU', 'IDST', 'IDHO', 'MONT', 'MTST', 'NAU', 'UNCO', 'PRST', 'SAC', 'WEB'],
      'Big South': ['CHSO', 'GWEB', 'HPU', 'LONG', 'PRES', 'RAD', 'SCUP', 'UNCA', 'WIN'],
      'Big Ten': ['ILL', 'IND', 'IOWA', 'MD', 'MICH', 'MSU', 'MINN', 'NEB', 'NW', 'OSU', 'ORE', 'PSU', 'PUR', 'RUTG', 'UCLA', 'USC', 'WASH', 'WIS'],
      'Big West': ['CSUN', 'CP', 'CSUB', 'CSUF', 'HAW', 'LBSU', 'UCD', 'UCI', 'UCR', 'UCSD', 'UCSB'],
      'Coastal': ['CAM', 'COFC', 'DREX', 'ELON', 'HAMP', 'HOF', 'MONM', 'NCAT', 'NE', 'STBK', 'TOW', 'UNCW', 'WM'],
      'Conference USA': ['DEL', 'FIU', 'JVST', 'KENN', 'LIB', 'LT', 'MOST', 'MTSU', 'NMSU', 'SHSU', 'UTSA', 'WKU'],
      'Horizon': ['CLEV', 'DETM', 'GB', 'IUPU', 'PFW', 'MILW', 'NKU', 'OAK', 'RMU', 'WRST', 'YSU'],
      'Ivy': ['BRWN', 'COLU', 'COR', 'DART', 'HARV', 'PENN', 'PRIN', 'YALE'],
      'MAAC': ['CAN', 'FAIR', 'IONA', 'MAN', 'MRMK', 'MRST', 'MSM', 'NIA', 'QUIN', 'RID', 'SHU', 'SPU', 'SIE'],
      'Mid-American': ['AKR', 'BALL', 'BGSU', 'BUFF', 'CMU', 'EMU', 'KENT', 'MASS', 'M-OH', 'NIU', 'OHIO', 'TOL', 'WMU'],
      'MEAC': ['COPP', 'DSU', 'HOW', 'MORG', 'NORF', 'NCCU', 'SCST', 'UMES'],
      'Missouri Valley': ['BEL', 'BRAD', 'DRKE', 'EVAN', 'ILST', 'INST', 'MUR', 'UIC', 'UNI', 'SIU', 'VALP'],
      'Mountain West': ['AFA', 'BOIS', 'CSU', 'FRES', 'GCU', 'NEV', 'UNM', 'SDSU', 'SJSU', 'UNLV', 'USU', 'WYO'],
      'Northeast': ['CCSU', 'CHST', 'FDU', 'LIU', 'SFPA', 'STO', 'WAG'],
      'Ohio Valley': ['EIU', 'LIN', 'MORE', 'SEMO', 'SIUE', 'TNST', 'TNTC', 'LR', 'USI', 'UTM', 'WIU'],
      'Patriot League': ['AMER', 'ARMY', 'BU', 'BUCK', 'COLG', 'HC', 'LAF', 'LEH', 'L-MD', 'NAVY'],
      'SEC': ['ALA', 'ARK', 'AUB', 'FLA', 'UGA', 'UK', 'LSU', 'MISS', 'MSST', 'MIZ', 'OKLA', 'SC', 'TENN', 'TA&M', 'TEX', 'VAN'],
      'Southern': ['UTC', 'ETSU', 'FUR', 'MER', 'SAM', 'UNCG', 'WCU', 'WOF'],
      'Southland': ['AMCC', 'HCU', 'IW', 'LAM', 'MCNS', 'NICH', 'NWST', 'SELA', 'SFA', 'TRGV', 'UNO'],
      'SWAC': ['AAMU', 'ALST', 'ALCN', 'BCU', 'FAMU', 'GRAM', 'JKST', 'MVSU', 'PV', 'SOU', 'TXSO', 'UAPB'],
      'Summit League': ['DEN', 'NDSU', 'OMA', 'ORU', 'SDAK', 'SDST', 'STMN', 'KC', 'UND'],
      'Sun Belt': ['APP', 'ARST', 'CCU', 'GASO', 'GAST', 'JMU', 'MRSH', 'ODU', 'TXST', 'TROY', 'UL', 'ULM', 'USA', 'USM'],
      'West Coast': ['GONZ', 'LMU', 'ORST', 'PAC', 'PEPP', 'PORT', 'SMC', 'USD', 'SF', 'SCU', 'SEA', 'WSU'],
      'WAC': ['ACU', 'CBU', 'SUU', 'TAR', 'UTA', 'UTU', 'UVU'],
      'Top 25': ['@T25'], // special indicator for Top 25 ranked teams

    },

    NCAAM_MM: {}, // no groups for March Madness

    // Generally no divisions / conferences for soccer
    EPL: {},
    ENGCHMP: {},
    UEFACHMP: {},
    UEFAEUROPA: {},
    UEFANATIONS: {},
    FIFAWC: {},
    BRASILEIRAO: {},
    BUNDESLIGA: {},
    FRL1: {},
    LALIGA: {},
    LIBERTADORES: {},
    MEX: {},
    SERIEA: {},

  },

  legacySoccer: {
    USA_NWSL: 'NWSL',
    USA_MLS: 'MLS',
    ENG_PREMIERE_LEAGUE: 'English Premier League',
  },
})
