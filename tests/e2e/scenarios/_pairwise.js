'use strict'

/*
  Algorithmic scenario generator. Two modes beyond the hand-curated set:

    pairwise — covers every pair of parameter values at least once.
               Typical size: 15–25 scenarios for the parameter set below.
    full     — cartesian product. Will produce hundreds of scenarios.
               Slow but exhaustive.

  Activated via the MATRIX_MODE env var. See _index.js.

  All generated scenarios reuse the same NHL fixture (final + scheduled
  games) so the screenshots only differ in visual flags / view style.
*/

const { espnScoreboardRoute, makeFinalGame, makeScheduledGame, TEAMS } = require('./_shared')

// Parameter space. Add or remove values here to widen/narrow coverage.
const PARAMS = {
  viewStyle: [
    'largeLogos',
    'mediumLogos',
    'smallLogos',
    'oneLine',
    'oneLineWithLogos',
    'stacked',
    'stackedWithLogos',
  ],
  colored: [true, false],
  highlightWinners: [true, false],
  shadeRows: [true, false],
  showLeagueSeparators: [true, false],
  hideBroadcasts: [true, false],
}

// Build a single NHL fixture reused across all generated scenarios.
function nhlFixture() {
  return {
    [espnScoreboardRoute('hockey/nhl')]: {
      events: [
        makeFinalGame({ home: TEAMS.TOR, away: TEAMS.MTL, hScore: 4, aScore: 2 }),
        makeFinalGame({ home: TEAMS.BOS, away: TEAMS.NYR, hScore: 3, aScore: 4 }),
        makeScheduledGame({ home: TEAMS.PIT, away: TEAMS.PHL }),
      ],
    },
  }
}

function scenarioFromCombo(combo, idx) {
  const tag = Object.entries(combo).map(([k, v]) => {
    if (typeof v === 'boolean') return `${k}=${v ? 'on' : 'off'}`
    return `${k}=${v}`
  }).join('_')
  return {
    name: `gen-${String(idx).padStart(3, '0')}--${tag}`,
    moduleConfig: {
      ...combo,
      sports: [{ league: 'NHL', teams: ['TOR', 'BOS', 'PIT'] }],
    },
    fixtures: nhlFixture(),
  }
}

// Full cartesian product.
function cartesian(paramObj) {
  const keys = Object.keys(paramObj)
  const out = [{}]
  for (const k of keys) {
    const next = []
    for (const partial of out) {
      for (const v of paramObj[k]) {
        next.push({ ...partial, [k]: v })
      }
    }
    out.splice(0, out.length, ...next)
  }
  return out
}

// Deterministic xorshift PRNG. Must produce identical output across runs so
// Playwright's main process and worker process generate the same test names.
function makeRand(seed) {
  let s = seed | 0 || 0xdeadbeef
  return function rand() {
    s ^= s << 13
    s ^= s >>> 17
    s ^= s << 5
    // unsigned modulo to keep range positive
    return ((s >>> 0) % 1_000_000) / 1_000_000
  }
}

// Pairwise: greedy IPOG-flavored algorithm.
// Produces a covering array where every (param-i=value, param-j=value)
// pair appears in at least one generated combination.
function pairwise(paramObj) {
  const keys = Object.keys(paramObj)
  if (keys.length < 2) return cartesian(paramObj)

  // Enumerate every uncovered pair: { paramI, valI, paramJ, valJ }
  const uncovered = new Set()
  const pairKey = (kI, vI, kJ, vJ) => `${kI}=${JSON.stringify(vI)}|${kJ}=${JSON.stringify(vJ)}`
  for (let i = 0; i < keys.length; i++) {
    for (let j = i + 1; j < keys.length; j++) {
      for (const vI of paramObj[keys[i]]) {
        for (const vJ of paramObj[keys[j]]) {
          uncovered.add(pairKey(keys[i], vI, keys[j], vJ))
        }
      }
    }
  }

  function pairsCoveredBy(combo) {
    const covered = []
    for (let i = 0; i < keys.length; i++) {
      for (let j = i + 1; j < keys.length; j++) {
        const k = pairKey(keys[i], combo[keys[i]], keys[j], combo[keys[j]])
        if (uncovered.has(k)) covered.push(k)
      }
    }
    return covered
  }

  const result = []
  // Seed: one full combination chosen to start.
  const seed = Object.fromEntries(keys.map(k => [k, paramObj[k][0]]))
  result.push(seed)
  pairsCoveredBy(seed).forEach(k => uncovered.delete(k))

  const rand = makeRand(0x5eed)
  while (uncovered.size > 0) {
    // Find the combo (among deterministic random search) that covers the
    // most remaining pairs. With small param spaces a partial sweep suffices.
    let best = null
    let bestCount = -1
    const SAMPLES = 200
    for (let s = 0; s < SAMPLES; s++) {
      const candidate = {}
      for (const k of keys) {
        const vals = paramObj[k]
        candidate[k] = vals[Math.floor(rand() * vals.length)]
      }
      const cnt = pairsCoveredBy(candidate).length
      if (cnt > bestCount) {
        bestCount = cnt
        best = candidate
      }
    }
    if (!best || bestCount === 0) break
    result.push(best)
    pairsCoveredBy(best).forEach(k => uncovered.delete(k))
  }
  return result
}

function generate(mode) {
  let combos
  if (mode === 'full') combos = cartesian(PARAMS)
  else if (mode === 'pairwise') combos = pairwise(PARAMS)
  else throw new Error(`Unknown matrix mode: ${mode}`)
  return combos.map((c, i) => scenarioFromCombo(c, i))
}

module.exports = { generate, PARAMS, pairwise, cartesian }
