'use strict'

/*
  Scenario registry. The MATRIX_MODE env var selects which scenarios run:

    MATRIX_MODE=curated   (default) — 25 hand-picked scenarios covering every
                                       view style, key flag, PR #198 upcoming
                                       games, broadcasts, and baseball detail.
    MATRIX_MODE=pairwise  — algorithmic covering array (~15–25 scenarios).
                            Every pair of parameter values appears at least
                            once. Reuses the same NHL fixture.
    MATRIX_MODE=full      — cartesian product (hundreds of scenarios). Slow.

  npm scripts:
    npm run test:e2e            → curated
    npm run test:e2e:pairwise   → pairwise
    npm run test:e2e:full       → full cartesian
*/

const MATRIX_MODE = process.env.MATRIX_MODE ?? 'curated'

const CURATED = [
  // A. View-style baselines (7)
  require('./viewstyle-largeLogos.js'),
  require('./viewstyle-mediumLogos.js'),
  require('./viewstyle-smallLogos.js'),
  require('./viewstyle-oneLine.js'),
  require('./viewstyle-oneLineWithLogos.js'),
  require('./viewstyle-stacked.js'),
  require('./viewstyle-stackedWithLogos.js'),

  // B. Game state (3)
  require('./state-nhl-overtime-final.js'),
  require('./state-mlb-in-progress.js'),
  require('./state-empty-no-games-today.js'),

  // C. PR #198 — upcoming games (3)
  require('./upcoming-on-all-final.js'),
  require('./upcoming-on-no-game-today.js'),
  require('./upcoming-off.js'),

  // D. Visual flags (4)
  require('./flag-colored-off.js'),
  require('./flag-shadeRows-on.js'),
  require('./flag-highlightWinners-off.js'),
  require('./flag-no-league-separators.js'),

  // E. NCAA rankings (1)
  require('./ncaa-rankings-on.js'),

  // F. Broadcasts (4)
  require('./broadcast-hideBroadcasts-on.js'),
  require('./broadcast-national-tv.js'),
  require('./broadcast-multiple-networks.js'),
  require('./broadcast-showLocalBroadcasts-on.js'),

  // G. Baseball detail (2)
  require('./baseball-detail-on.js'),
  require('./baseball-detail-bases-loaded.js'),

  // H. Multi-sport (1)
  require('./multi-nfl-nhl-mlb.js'),
]

let SCENARIOS
if (MATRIX_MODE === 'curated') {
  SCENARIOS = CURATED
}
else if (MATRIX_MODE === 'pairwise' || MATRIX_MODE === 'full') {
  const { generate } = require('./_pairwise.js')
  SCENARIOS = generate(MATRIX_MODE)
  console.log(`[matrix] MATRIX_MODE=${MATRIX_MODE} → ${SCENARIOS.length} scenarios`)
}
else {
  throw new Error(`Unknown MATRIX_MODE='${MATRIX_MODE}'. Use curated|pairwise|full.`)
}

module.exports = { SCENARIOS, MATRIX_MODE }
