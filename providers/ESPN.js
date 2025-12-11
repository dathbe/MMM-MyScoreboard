/*

  -------------------------------------
    Provider for ESPN Scoreboard Data
  -------------------------------------

  Provides scores for
    NCAAF (College Football, FBS Division)
    NCAAM (College Basketball. Division I)
    NCAAM_MM (College Basketball, March Madness Tournament)
    MLB (Major League Baseball)
    NHL
    NFL
    Every Soccer league ESPN supports

  You can get an idea of what sports and leagues are
  supported here:
  http://www.espn.com/static/apis/devcenter/io-docs.html

  Documentation for the feed can be found here:
  http://www.espn.com/static/apis/devcenter/docs/scores.html#parameters

  ESPN has several different APIs for various sports data,
  most of which need an API key.  ESPN no longer gives out
  public API keys.  The good news is the Scoreboard API does
  not require an API key. It's free and clear.  Let's not
  abuse this.  Please do not modify this to hammer the API
  with a flood of calls, otherwise it might cause ESPN to
  lock this it down.

  Data is polled on demand per league configured in the
  front end. Each time the front end makes a request for a
  particular league a request for JSON is made to ESPN's
  servers.  The front end polls every two minutes.

*/

const Log = require('logger')
const moment = require('moment-timezone')

module.exports = {

  PROVIDER_NAME: 'ESPN',

  LEAGUE_PATHS: {

    // North American Leagues
    'NCAAF': 'football/college-football',
    'NBA': 'basketball/nba',
    'WNBA': 'basketball/wnba',
    'NBAG': 'basketball/nba-development',
    'NCAAM': 'basketball/mens-college-basketball',
    'NCAAM_MM': 'basketball/mens-college-basketball',
    'NCAAW': 'basketball/womens-college-basketball',
    'PLL': 'lacrosse/pll',
    'NLL': 'lacrosse/nll',
    'MLB': 'baseball/mlb',
    'NFL': 'football/nfl',
    'NHL': 'hockey/nhl',
    'MLS': 'soccer/usa.1',
    'RUGBY': 'rugby/scorepanel',

    // International Soccer
    'AFC_ASIAN_CUP': 'soccer/afc.cup',
    'AFC_ASIAN_CUP_Q': 'soccer/afc.cupq',
    'AFF_CUP': 'soccer/aff.championship',
    'AFR_NATIONS_CUP': 'soccer/caf.nations',
    'AFR_NATIONS_CUP_Q': 'soccer/caf.nations_qual',
    'AFR_NATIONS_CHAMPIONSHIP': 'soccer/caf.championship',
    'CONCACAF_GOLD_CUP': 'soccer/concacaf.gold',
    'CONCACAF_NATIONS_Q': 'soccer/concacaf.nations.league_qual',
    'CONCACAF_WOMENS_CHAMPIONSHIP': 'soccer/concacaf.womens.championship',
    'CONMEBOL_COPA_AMERICA': 'soccer/conmebol.america',
    'FIFA_CLUB_WORLD_CUP': 'soccer/fifa.cwc',
    'FIFA_CONFEDERATIONS_CUP': 'soccer/fifa.confederations',
    'FIFA_MENS_FRIENDLIES': 'soccer/fifa.friendly',
    'FIFA_MENS_OLYMPICS': 'soccer/fifa.olympics',
    'FIFA_WOMENS_FRIENDLIES': 'soccer/fifa.friendly.w',
    'FIFA_WOMENS_OLYMPICS': 'soccer/fifa.w.olympics',
    'FIFA_WOMENS_WORLD_CUP': 'soccer/fifa.wwc',
    'FIFA_WORLD_CUP': 'soccer/fifa.world',
    'FIFA_WORLD_CUP_Q_AFC': 'soccer/fifa.worldq.afc',
    'FIFA_WORLD_CUP_Q_CAF': 'soccer/fifa.worldq.caf',
    'FIFA_WORLD_CUP_Q_CONCACAF': 'soccer/fifa.worldq.concacaf',
    'FIFA_WORLD_CUP_Q_CONMEBOL': 'soccer/fifa.worldq.conmebol',
    'FIFA_WORLD_CUP_Q_OFC': 'soccer/fifa.worldq.ofc',
    'FIFA_WORLD_CUP_Q_UEFA': 'soccer/fifa.worldq.uefa',
    'FIFA_WORLD_U17': 'soccer/fifa.world.u17',
    'FIFA_WORLD_U20': 'soccer/fifa.world.u20',
    'UEFA_CHAMPIONS': 'soccer/uefa.champions',
    'UEFA_WOMENS_CHAMPIONS': 'soccer/uefa.wchampions',
    'UEFA_EUROPA': 'soccer/uefa.europa',
    'UEFA_EUROPA_CONF': 'soccer/uefa.europa.conf',
    'UEFA_EUROPEAN_CHAMPIONSHIP': 'soccer/uefa.euro',
    'UEFA_EUROPEAN_CHAMPIONSHIP_Q': 'soccer/uefa.euroq',
    'UEFA_EUROPEAN_CHAMPIONSHIP_U19': 'soccer/uefa.euro.u19',
    'UEFA_EUROPEAN_CHAMPIONSHIP_U21': 'soccer/uefa.euro_u21',
    'UEFA_NATIONS': 'soccer/uefa.nations',
    'SAFF_CHAMPIONSHIP': 'soccer/afc.saff.championship',
    'WOMENS_EUROPEAN_CHAMPIONSHIP': 'soccer/uefa.weuro',
    'UEFA_WOMENS_NATIONS': 'soccer/uefa.w.nations',

    // UK / Ireland Soccer
    'ENG_CARABAO_CUP': 'soccer/eng.league_cup',
    'ENG_CHAMPIONSHIP': 'soccer/eng.2',
    'ENG_EFL': 'soccer/eng.trophy',
    'ENG_FA_CUP': 'soccer/eng.fa',
    'ENG_LEAGUE_1': 'soccer/eng.3',
    'ENG_LEAGUE_2': 'soccer/eng.4',
    'ENG_NATIONAL': 'soccer/eng.5',
    'English Premier League': 'soccer/eng.1',
    'IRL_PREM': 'soccer/irl.1',
    'NIR_PREM': 'soccer/nir.1',
    'SCO_CIS': 'soccer/sco.cis',
    'SCO_CHALLENGE_CUP': 'soccer/sco.challenge',
    'SCO_CHAMPIONSHIP': 'soccer/sco.2',
    'SCO_CUP': 'soccer/sco.tennents',
    'SCO_LEAGUE_1': 'soccer/sco.3',
    'SCO_LEAGUE_2': 'soccer/sco.4',
    'SCO_PREM': 'soccer/sco.1',
    'WAL_PREM': 'soccer/wal.1',
    'ENG_WSL': 'soccer/eng.w.1',

    // European Soccer
    'AUT_BUNDESLIGA': 'soccer/aut.1',
    'BEL_DIV_A': 'soccer/bel.1',
    'DEN_SAS_LIGAEN': 'soccer/den.1',
    'ESP_COPA_DEL_REY': 'soccer/esp.copa_del_rey',
    'ESP_LALIGA': 'soccer/esp.1',
    'ESP_SEGUNDA_DIV': 'soccer/esp.2',
    'FRA_COUPE_DE_FRANCE': 'soccer/fra.coupe_de_france',
    'FRA_COUPE_DE_LA_LIGUE': 'soccer/fra.coupe_de_la_ligue',
    'FRA_LIGUE_1': 'soccer/fra.1',
    'FRA_LIGUE_2': 'soccer/fra.2',
    'GER_2_BUNDESLIGA': 'soccer/ger.2',
    'GER_BUNDESLIGA': 'soccer/ger.1',
    'GER_DFB_POKAL': 'soccer/ger.dfb_pokal',
    'GRE_SUPER_LEAGUE': 'soccer/gre.1',
    'ISR_PREMIER_LEAGUE': 'soccer/isr.1',
    'ITA_SERIE_A': 'soccer/ita.1',
    'ITA_SERIE_B': 'soccer/ita.2',
    'ITA_COPPA_ITALIA': 'soccer/ita.coppa_italia',
    'MLT_PREMIER_LEAGUE': 'soccer/mlt.1',
    'NED_EERSTE_DIVISIE': 'soccer/ned.2',
    'NED_EREDIVISIE': 'soccer/ned.1',
    'NED_KNVB_BEKER': 'soccer/ned.cup',
    'NOR_ELITESERIEN': 'soccer/nor.1',
    'POR_LIGA': 'soccer/por.1',
    'ROU_FIRST_DIV': 'soccer/rou.1',
    'RUS_PREMIER_LEAGUE': 'soccer/rus.1',
    'SUI_SUPER_LEAGUE': 'soccer/sui.1',
    'SWE_ALLSVENSKANLIGA': 'soccer/swe.1',
    'TUR_SUPER_LIG': 'soccer/tur.1',

    // South American Soccer
    'ARG_COPA': 'soccer/arg.copa',
    'ARG_NACIONAL_B': 'soccer/arg.2',
    'ARG_PRIMERA_DIV_B': 'soccer/arg.3',
    'ARG_PRIMERA_DIV_C': 'soccer/arg.4',
    'ARG_PRIMERA_DIV_D': 'soccer/arg.5',
    'ARG_SUPERLIGA': 'soccer/arg.1',
    'BOL_LIGA_PRO': 'soccer/bol.1',
    'BRA_CAMP_CARIOCA': 'soccer/bra.camp.carioca',
    'BRA_CAMP_GAUCHO': 'soccer/bra.camp.gaucho',
    'BRA_CAMP_MINEIRO': 'soccer/bra.camp.mineiro',
    'BRA_CAMP_PAULISTA': 'soccer/bra.camp.paulista',
    'BRA_COPA': 'soccer/bra.copa_do_brazil',
    'BRA_SERIE_A': 'soccer/bra.1',
    'BRA_SERIE_B': 'soccer/bra.2',
    'BRA_SERIE_C': 'soccer/bra.3',
    'CHI_COPA': 'soccer/chi.copa_chi',
    'CHI_PRIMERA_DIV': 'soccer/chi.1',
    'COL_COPA': 'soccer/col.copa',
    'COL_PRIMERA_A': 'soccer/col.1',
    'COL_PRIMERA_B': 'soccer/col.2',
    'CONMEBOL_COPA_LIBERTADORES': 'soccer/conmebol.libertadores',
    'CONMEBOL_COPA_SUDAMERICANA': 'soccer/conmebol.sudamericana',
    'ECU_PRIMERA_A': 'soccer/ecu.1',
    'PAR_PRIMERA_DIV': 'soccer/par.1',
    'PER_PRIMERA_PRO': 'soccer/per.1',
    'URU_PRIMERA_DIV': 'soccer/uru.1',
    'VEN_PRIMERA_PRO': 'soccer/ven.1',

    // North American Soccer
    'CONCACAF_CHAMPIONS': 'soccer/concacaf.champions',
    'CONCACAF_LEAGUE': 'soccer/concacaf.league',
    'CRC_PRIMERA_DIV': 'soccer/crc.1',
    'GUA_LIGA_NACIONAL': 'soccer/gua.1',
    'HON_PRIMERA_DIV': 'soccer/hon.1',
    'JAM_PREMIER_LEAGUE': 'soccer/jam.1',
    'MEX_ASCENSO_MX': 'soccer/mex.2',
    'MEX_COPA_MX': 'soccer/mex.copa_mx',
    'MEX_LIGA_BANCOMER': 'soccer/mex.1',
    'SLV_PRIMERA_DIV': 'soccer/slv.1',
    'USA_MLS': 'soccer/usa.1',
    'USA_NCAA_SL_M': 'soccer/usa.ncaa.m.1',
    'USA_NCAA_SL_W': 'soccer/usa.ncaa.w.1',
    'USA_NASL': 'soccer/usa.nasl',
    'NWSL': 'soccer/usa.nwsl',
    'USA_OPEN': 'soccer/usa.open',
    'USA_USL': 'soccer/usa.usl.1',
    'NSL': 'soccer/can.w.nsl',

    // Asian Soccer
    'AFC_CHAMPIONS': 'soccer/afc.champions',
    'AUS_A_LEAGUE': 'soccer/aus.1',
    'AUS_A_WOMEN': 'soccer/aus.w.1',
    'CHN_SUPER_LEAGUE': 'soccer/chn.1',
    'IDN_SUPER_LEAGUE': 'soccer/idn.1',
    'IND_I_LEAGUE': 'soccer/ind.2',
    'IND_SUPER_LEAGUE': 'soccer/ind.1',
    'JPN_J_LEAGUE': 'soccer/jpn.1',
    'MYS_SUPER_LEAGUE': 'soccer/mys.1',
    'SGP_PREMIER_LEAGUE': 'soccer/sgp.1',
    'THA_PREMIER_LEAGUE': 'soccer/tha.1',

    // African Soccer
    'CAF_CHAMPIONS': 'soccer/caf.champions',
    'CAF_CONFED_CUP': 'soccer/caf.confed',
    'GHA_PREMIERE_LEAGUE': 'soccer/gha.1',
    'KEN_PREMIERE_LEAGUE': 'soccer/ken.1',
    'NGA_PRO_LEAGUE': 'soccer/nga.1',
    'RSA_FIRST_DIV': 'soccer/rsa.2',
    'RSA_NEDBANK_CUP': 'soccer/rsa.nedbank',
    'RSA_PREMIERSHIP': 'soccer/rsa.1',
    'RSA_TELKOM_KNOCKOUT': 'soccer/rsa.telkom_knockout',
    'UGA_SUPER_LEAGUE': 'soccer/uga.1',
    'ZAM_SUPER_LEAGUE': 'soccer/zam.1',
    'ZIM_PREMIER_LEAGUE': 'soccer/zim.1',

    // Other
    'AFL': 'australian-football/afl',
    'PREMIERSHIP_RUGBY': 'rugby/267979',
    'RUGBY_WORLD_CUP': 'rugby/164205',
    'SIX_NATIONS': 'rugby/180659',
    'THE_RUGBY_CHAMPIONSHIP': 'rugby/244293',
    'EUROPEAN_RUGBY_CHAMPIONS_CUP': 'rugby/271937',
    'UNITED_RUGBY_CHAMPIONSHIP': 'rugby/270557',
    'SUPER_RUGBY_PACIFIC': 'rugby/242041',
    'OLYMPIC_MENS_7S': 'rugby/282',
    'OLYMPIC_WOMENS_RUGBY_SEVENS': 'rugby/283',
    'INTERNATIONAL_TEST_MATCH': 'rugby/289234',
    'URBA_TOP_12': 'rugby/289279',
    'MITRE_10_CUP': 'rugby/270563',
    'Major League Rugby': 'rugby/289262',

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
    'English Premier League',
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

  broadcastIcons: {
    'ACC Network': 'https://upload.wikimedia.org/wikipedia/commons/f/fd/ACC_Network_ESPN_logo.svg',
    'ACC Extra': './modules/MMM-MyScoreboard/logos/channels/ACC-NX-logo.png',
    'B1G+': './modules/MMM-MyScoreboard/logos/channels/B1GPlus.png',
    'BTN': 'https://upload.wikimedia.org/wikipedia/en/3/39/Big_Ten_Network_Logo.svg',
    'CW': 'https://upload.wikimedia.org/wikipedia/commons/b/b1/The_CW_2024.svg',
    'Disney+': 'https://upload.wikimedia.org/wikipedia/commons/6/64/Disney%2B_2024.svg',
    'ESPN': 'https://upload.wikimedia.org/wikipedia/commons/2/2f/ESPN_wordmark.svg',
    'ESPN2': 'https://upload.wikimedia.org/wikipedia/commons/b/bf/ESPN2_logo.svg',
    'ESPN3': 'https://upload.wikimedia.org/wikipedia/commons/2/2b/ESPN3_logo.svg',
    'ESPN+': './modules/MMM-MyScoreboard/logos/channels/ESPN+.svg',
    'ESPNEWS': 'https://upload.wikimedia.org/wikipedia/commons/1/1b/ESPNews.svg',
    'ESPNU': 'https://storage.googleapis.com/byucougars-prod/2023/08/15/FDU7FuMUvL1g21JvnaSPUSCWAvfZZXq11MRP7pKp.svg',
    'ESPN Deportes': './modules/MMM-MyScoreboard/logos/channels/ESPNDeportes.svg',
    'FOX Deportes': 'https://upload.wikimedia.org/wikipedia/commons/3/3b/FOX_Deportes_logo.png',
    'FS1': 'https://upload.wikimedia.org/wikipedia/commons/3/37/2015_Fox_Sports_1_logo.svg',
    'FS2': 'https://upload.wikimedia.org/wikipedia/commons/3/38/FS2_logo_2015.svg',
    'HBO Max': 'https://www.hbomax.com/img/hbomax/logo_nav_bar.png',
    'Hulu': 'https://upload.wikimedia.org/wikipedia/commons/f/f9/Hulu_logo_%282018%29.svg',
    'Max': 'https://upload.wikimedia.org/wikipedia/commons/c/ce/Max_logo.svg',
    'MLB Net': 'https://upload.wikimedia.org/wikipedia/en/a/ac/MLBNetworkLogo.svg',
    'MLBN': 'https://upload.wikimedia.org/wikipedia/en/a/ac/MLBNetworkLogo.svg',
    'MLB.TV Free Game': './modules/MMM-MyScoreboard/logos/channels/MLBTVFreeGame.png',
    'NBA League Pass': 'https://cdn.nba.com/manage/2025/02/NBA_League_Pass_horiz_onDkBkgd_NEWLOGO.png',
    'NBA TV': 'https://upload.wikimedia.org/wikipedia/en/d/d2/NBA_TV.svg',
    'NBC': 'https://upload.wikimedia.org/wikipedia/commons/9/9f/NBC_Peacock_1986.svg',
    'NFL Net': 'https://upload.wikimedia.org/wikipedia/en/8/8f/NFL_Network_logo.svg',
    'NHL Net': 'https://upload.wikimedia.org/wikipedia/commons/f/f4/NHL_Network_2012.svg',
    'NWSL+': './modules/MMM-MyScoreboard/logos/channels/NWSL+.webp',
    'Paramount+': 'https://upload.wikimedia.org/wikipedia/commons/4/4e/Paramount%2B_logo.svg',
    'Peacock': './modules/MMM-MyScoreboard/logos/channels/Peacock.svg',
    'Prime Video': 'https://upload.wikimedia.org/wikipedia/commons/9/90/Prime_Video_logo_%282024%29.svg',
    'Roku': 'https://image.roku.com/w/rapid/images/logo-image/aaef8f1c-af36-41a7-b851-d4cc32a55946.svg',
    'SEC Network': 'https://upload.wikimedia.org/wikipedia/commons/f/fd/SEC_Network_%282024%29.svg',
    'SECN+': './modules/MMM-MyScoreboard/logos/channels/SECPlus.png',
    'TBS': 'https://upload.wikimedia.org/wikipedia/commons/2/2c/TBS_2020.svg',
    'Tele': './modules/MMM-MyScoreboard/logos/channels/Tele.svg',
    'TNT': 'https://www.tntdrama.com/themes/custom/ten_theme/images/tnt/tnt_logo_top.png',
    'truTV': './modules/MMM-MyScoreboard/logos/channels/truTV.svg',
    'TUDN': './modules/MMM-MyScoreboard/logos/channels/TUDN.svg',
    'USA Net': 'https://upload.wikimedia.org/wikipedia/commons/d/d7/USA_Network_logo_%282016%29.svg',
    'Universo': './modules/MMM-MyScoreboard/logos/channels/Universo.svg',
    'Victory+': './modules/MMM-MyScoreboard/logos/channels/Victory+.svg',

    'Altitude 2 Sports': './modules/MMM-MyScoreboard/logos/channels/Altitude2Sports.png',
    'Arizona\'s Family 3TV': 'https://upload.wikimedia.org/wikipedia/commons/0/00/KTVK_logo.svg',
    'BlazerVision': './modules/MMM-MyScoreboard/logos/channels/BlazerVision.png',
    'CHSN': 'https://upload.wikimedia.org/wikipedia/en/6/68/Chicago_Sports_Network_Logo.png',
    'CHSN+': './modules/MMM-MyScoreboard/logos/channels/CHSNPlus.webp',
    'CLEGuardians.TV': './modules/MMM-MyScoreboard/logos/channels/CLEGuardiansTV.svg',
    'ClipperVision': './modules/MMM-MyScoreboard/logos/channels/ClipperVision.webp',
    'CW33': './modules/MMM-MyScoreboard/logos/channels/CW33.svg',
    'DBACKS.TV': './modules/MMM-MyScoreboard/logos/channels/DBACKSTV.svg',
    // 'FanDuel': 'https://www.stayonsearch.com/wp-content/uploads/2018/09/fanduel-logo-300.png',
    'FanDuel': 'https://upload.wikimedia.org/wikipedia/en/f/f4/Fanduel_Official_Logo_2022.svg',
    'GCSEN': 'https://upload.wikimedia.org/wikipedia/en/7/70/GCSEN_Logo.png',
    'Jazz+': './modules/MMM-MyScoreboard/logos/channels/JazzPlus.svg',
    'KATU 2.2': './modules/MMM-MyScoreboard/logos/channels/KATU.svg',
    'KCAL': './modules/MMM-MyScoreboard/logos/channels/KCAL.svg',
    'KCOP': 'https://static.foxtv.com/static/orion/img/core/s/logos/fts-los-angeles-a.svg',
    'KENS 5': 'https://www.kens5.com/assets/shared-images/logos/kens.png',
    'KFAA-TV': './modules/MMM-MyScoreboard/logos/channels/KFAATV.webp',
    'KFMB 8.1 (CBS)': 'https://www.cbs8.com/assets/shared-images/logos/kfmb.png',
    'KHN': './modules/MMM-MyScoreboard/logos/channels/KHN1.png',
    'KING 5': 'https://upload.wikimedia.org/wikipedia/commons/1/1c/KING-TV_Logo.svg',
    'KJZZ-TV': './modules/MMM-MyScoreboard/logos/channels/KJZZ-TV.png',
    'KMOV-TV': 'https://www.firstalert4.com/pf/resources/images/mastheads/logos/kmov.svg?d=486&mxId=00000000',
    'KMSP-TV': 'https://static.foxtv.com/static/orion/img/core/s/logos/fts-minneapolis-a.svg',
    'KNTV': './modules/MMM-MyScoreboard/logos/channels/KNTV.svg',
    'KONG': 'https://upload.wikimedia.org/wikipedia/commons/6/6a/KONG_%28TV%29_logo_2016.svg',
    'KPNX': 'https://upload.wikimedia.org/wikipedia/commons/5/5f/KPNX_12_logo.svg',
    'KTVD-TV (My20)': 'https://my20denver.azurewebsites.net/graphics/logo-top.png',
    'KUNP 16': './modules/MMM-MyScoreboard/logos/channels/KUNP16.svg',
    'KUSA-TV (9NEWS)': 'https://www.9news.com/assets/shared-images/logos/kusa.png',
    'KVVU': 'https://www.fox5vegas.com/pf/resources/images/mastheads/logos/kvvu.svg?d=489',
    'Marquee Sports Net': 'https://dupvhm5r1oaxt.cloudfront.net/uploads/2020/02/CUBS_MSN_Logo_white.png',
    'MASN': 'https://www.masnsports.com/images/masn.svg',
    'MASN2': 'https://video.masnsports.com/assets/images/masn2.svg',
    'MAS+': './modules/MMM-MyScoreboard/logos/channels/MASPlus.png',
    'Matrix Midwest': 'https://upload.wikimedia.org/wikipedia/en/b/b1/Matrix_Midwest_Logo.svg',
    'Mavs.com': 'https://www.mavs.com/wp-content/uploads/2024/12/mavstv-logo.png',
    'MLB.com': 'https://www.mlbstatic.com/team-logos/league-on-dark/1.svg',
    'MLB.TV': 'https://images.ctfassets.net/iiozhi00a8lc/78yBC9oWuP1VldT6aJT1sL/8cc2b4b9d9ab83e6a90ee48476b66074/MLBTV_19_ondark_RGB.svg',
    'MNMT': './modules/MMM-MyScoreboard/logos/channels/MNMT.svg',
    'MSG': './modules/MMM-MyScoreboard/logos/channels/MSG.png',
    'MSG2': 'https://images.fubo.tv/station_logos/msg_2_m.png',
    // 'MSGB': './modules/MMM-MyScoreboard/logos/channels/MSG.png',
    'MSGSN': './modules/MMM-MyScoreboard/logos/channels/MSGSN.png',
    'NBC 10': 'https://upload.wikimedia.org/wikipedia/commons/2/20/WCAU_2023.svg',
    'NBCSCA+': './modules/MMM-MyScoreboard/logos/channels/NBCSCAPlus.svg',
    'NBC Sports': 'https://nbcsports.brightspotcdn.com/76/a1/28ae939d488781e23e1813aaecb3/nbc-sports-logo-1.svg',
    'NESN': './modules/MMM-MyScoreboard/logos/channels/NESN.svg',
    'NESN+': './modules/MMM-MyScoreboard/logos/channels/NESNPlus.svg',
    'Padres.TV': 'https://www.mlbstatic.com/team-logos/product-on-light/padres-tv.svg',
    'Pelicans.com': 'https://watch.pelicans.com/event-management/watch.pelicans.com/assets/website/1729016319606_pelicans_plus_logo.png',
    'Rangers Sports Network': 'https://upload.wikimedia.org/wikipedia/commons/f/fe/Rangers_Sports_Network_Logo.png',
    'Rockies.TV': './modules/MMM-MyScoreboard/logos/channels/RockiesTV.svg',
    'Root Sports NW': 'https://upload.wikimedia.org/wikipedia/en/8/8b/Root_Sports_logo.svg',
    'Scripps Sports': './modules/MMM-MyScoreboard/logos/channels/ScrippsSports.webp',
    'SNY': 'https://sny.tv/images/sny.svg',
    'Space City Home Network': 'https://static.wixstatic.com/media/b2a684_6cb9aa9a46fa4478bdeb7f3afe95713d~mv2.png/v1/fill/w_233,h_77,al_c,q_85,usm_0.66_1.00_0.01,enc_avif,quality_auto/b2a684_6cb9aa9a46fa4478bdeb7f3afe95713d~mv2.png',
    'Spectrum Sports Net': 'https://spectrumsportsnet.com/content/dam/sports/images/SpectrumSportsNetLogo.svg',
    'Sportsnet': './modules/MMM-MyScoreboard/logos/channels/Sportsnet.svg',
    'Sportsnet 360': './modules/MMM-MyScoreboard/logos/channels/Sportsnet360.svg',
    'Sportsnet East': './modules/MMM-MyScoreboard/logos/channels/SportsnetEast.png',
    'Sportsnet LA': 'https://spectrumsportsnet.com/content/dam/sports/images/logo-sports-net-la.svg',
    'Sportsnet One': './modules/MMM-MyScoreboard/logos/channels/SportsnetOne.svg',
    'Sportsnet Ontario': './modules/MMM-MyScoreboard/logos/channels/SportsnetOntario.svg',
    'SportsNet PIT': './modules/MMM-MyScoreboard/logos/channels/SportsNetPIT.svg',
    'SportsNet PIT+': './modules/MMM-MyScoreboard/logos/channels/SportsNetPITPlus.svg',
    'Suns Live': './modules/MMM-MyScoreboard/logos/channels/SunsLive.svg',
    'The U': './modules/MMM-MyScoreboard/logos/channels/TheU.png',
    'TSN': 'https://www.tsn.ca/content/dam/sports/images/main-navigation/group_1/tsn_100x24.png',
    'TVA': 'https://upload.wikimedia.org/wikipedia/commons/0/00/TVA_logo_2020.svg',
    'TV-20 Detroit': './modules/MMM-MyScoreboard/logos/channels/TV20Detroit.png',
    'Twins.TV': './modules/MMM-MyScoreboard/logos/channels/TwinsTV.svg',
    'Utah 16': 'https://upload.wikimedia.org/wikipedia/commons/f/f4/KUPX-TV_logo_2023.svg',
    'WBFS': './modules/MMM-MyScoreboard/logos/channels/WBFS.svg',
    'WITI FOX-6': 'https://static.foxtv.com/static/orion/img/core/s/logos/fts-milwaukee-a.svg',
    'WLNY': './modules/MMM-MyScoreboard/logos/channels/WLNY.svg',
    'WPIX': 'https://pix11.com/wp-content/uploads/sites/25/2021/02/PIX11_White_600x248.png',
    'WTOG': 'https://upload.wikimedia.org/wikipedia/commons/1/1d/TAMPA_BAY_44_WTOG.png',
    'YES': 'https://static.yesnetwork.com/assets/images/light-on-dark/yes.svg',
  },

  broadcastIconsInvert: {
    'ABC': 'https://upload.wikimedia.org/wikipedia/commons/2/2f/ABC-2021-LOGO.svg',
    'Apple TV+': 'https://upload.wikimedia.org/wikipedia/commons/2/28/Apple_TV_Plus_Logo.svg',
    // CBS: 'https://upload.wikimedia.org/wikipedia/commons/b/bd/CBS_Eyemark.svg',
    'CBS': 'https://upload.wikimedia.org/wikipedia/commons/e/ee/CBS_logo_%282020%29.svg',
    'CBSSN': 'https://upload.wikimedia.org/wikipedia/commons/0/04/CBS_Sports_Network_2021.svg',
    'DAZN': 'https://upload.wikimedia.org/wikipedia/commons/0/06/DAZN_Logo_Master.svg',
    'FOX': 'https://upload.wikimedia.org/wikipedia/commons/c/c0/Fox_Broadcasting_Company_logo_%282019%29.svg',
    'ION': 'https://upload.wikimedia.org/wikipedia/commons/2/28/Ion_logo.svg',
    'MLS Season Pass': 'https://upload.wikimedia.org/wikipedia/commons/7/71/MLS_Season_Pass_logo_black.svg',

    'Altitude Sports': 'https://upload.wikimedia.org/wikipedia/en/e/e2/Altitude_Sports_logo.svg',
    'Spectrum Sports Net +': 'https://thestreamable.com/media/pages/video-streaming/spectrum-sportsnet-plus/4a9b2bff0c-1698772675/sportsnetb-1.svg',
    'WFAA Channel 8': 'https://upload.wikimedia.org/wikipedia/commons/6/65/WFAA_logo.svg',
  },

  freeGameOfTheDay: {
    day: '',
    teams: [],
  },

  getLeaguePath: function (league) {
    return this.LEAGUE_PATHS[league]
  },

  async getScores(payload, gameDate, callback) {
    var self = this

    var url = 'https://site.web.api.espn.com/apis/site/v2/sports/'
    url += this.getLeaguePath(payload.league)
    if (this.getLeaguePath(payload.league).includes('scorepanel')) {
      url += '?dates='
    }
    else {
      url += '/scoreboard?dates='
    }
    url += moment(gameDate).format('YYYYMMDD') + '&limit=200'
    var MLBurl = 'https://mastapi.mobile.mlbinfra.com/api/epg/v3/search?date='
      + moment().add(payload.debugHours, 'hours').add(payload.debugMinutes, 'minutes').format('YYYY-MM-DD') + '&exp=MLB'
    /*
      by default, ESPN returns only the Top 25 ranked teams for NCAAF
      and NCAAM. By appending the group parameter (80 for NCAAF and 50
      for NCAAM, found in the URL of their respective scoreboard pages
      on ESPN.com) we'll get the entire game list.

      March Madness is grouped separately in ESPN's feed. The way I
      currently have things set up, I need to treat it like a different
      league.
    */
    if (payload.league == 'NCAAF') {
      url = url + '&groups=80'
    }
    else if (payload.league == 'NCAAM') {
      url = url + '&groups=50'
    }
    else if (payload.league == 'NCAAM_MM') {
      url = url + '&groups=100'
    }

    try {
      const response = await fetch(url)
      Log.debug(`[MMM-MyScoreboard] ${url} fetched`)
      var body = await response.json()

      if (this.freeGameOfTheDay['day'] !== moment(gameDate).format('YYYY-MM-DD') && payload.league === 'MLB' && !payload.hideBroadcasts) {
        const freeGameResponse = await fetch(MLBurl)
        Log.debug(`[MMM-MyScoreboard] ${MLBurl} fetched`)
        const freeGameBody = await freeGameResponse.json()
        if (freeGameBody['results']) {
          freeGameBody['results'].forEach ((game) => {
            if (game['videoFeeds'].length > 0 && game['videoFeeds'][0]['freeGame']) {
              this.freeGameOfTheDay['day'] = moment().add(payload.debugHours, 'hours').add(payload.debugMinutes, 'minutes').format('YYYY-MM-DD')
              this.freeGameOfTheDay['teams'].push(game['gameData']['away']['teamAbbrv'])
              this.freeGameOfTheDay['teams'].push(game['gameData']['home']['teamAbbrv'])
              if (this.freeGameOfTheDay['teams'].includes('AZ')) {
                this.freeGameOfTheDay['teams'].push('ARI')
              }
            }
          })
        }
      }

      if (this.getLeaguePath(payload.league).includes('scorepanel')) {
        var body2 = { events: [] }
        for (let leagueIdx = 0; leagueIdx < body['scores'].length; leagueIdx++) {
          body2['events'] = body2['events'].concat(body['scores'][leagueIdx]['events'])
        }
        body = body2
      }

      this.noGamesToday = false
      callback(self.formatScores(payload, body, moment(gameDate).format('YYYYMMDD')), payload.index, this.noGamesToday)
    }
    catch (error) {
      Log.error(`[MMM-MyScoreboard] ${error} ${url}`)
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
      if (this.freeGameOfTheDay['day'] === moment(game.competitions[0].date).format('YYYY-MM-DD') && payload.league === 'MLB' && this.freeGameOfTheDay['teams'].includes(hTeamData.team.abbreviation)) {
        channels.push(`<img src="${this.broadcastIcons['MLB.TV Free Game']}" class="broadcastIcon">`)
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
          playoffStatus: playoffStatus,
        })
      }
    })

    if (formattedGamesList.length === 0) {
      this.noGamesToday = true
    }
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

}
