# MMM-MyScoreboard Test Suite

Automated tests for the MagicMirror² module — unit tests (`node:test`) plus
Playwright end-to-end tests driving a real MagicMirror server.

## What is covered

**Unit (`tests/unit/`)** — ~120 tests against pure functions:

| Area | File | What |
|---|---|---|
| Temporal helpers | `utils/time.test.js` | leap years, DST, half-hour zones, year boundaries |
| ESPN scoreboard helpers | `providers/ESPN.scoreboard.test.js` | `getLeaguePath`, `isSoccer`, `getOrdinal`, `getPeriod`, `getFinalOT`, `getFinalPK` |
| ESPN schedule (PR #198) | `providers/ESPN.schedule.test.js` | `extractNextGame` edge cases, `getTeamSchedule` cache + HTTP error paths |
| CPL | `providers/CPL.test.js` | parsing, name fallback chain, HTTP/network error handling |
| node_helper upcoming dispatch (PR #198) | `node_helper/upcoming-dispatch.test.js` | supported/unsupported provider routing |
| Frontend upcoming logic (PR #198) | `frontend/getEligibleUpcomingTeams.test.js`, `frontend/maybeRequestUpcoming.test.js` | MLB doubleheader, throttle, rollover gate, provider gating |

**End-to-end (`tests/e2e/`)** — 20 scenarios that boot a real MagicMirror
server, route provider HTTP to a local fixture server, render the module
in Chromium, and capture a screenshot per scenario.

The matrix covers:
- All 7 view styles (`largeLogos`, `mediumLogos`, `smallLogos`, `oneLine`, `oneLineWithLogos`, `stacked`, `stackedWithLogos`)
- Game states (in-progress MLB, NHL overtime final, empty)
- PR #198 upcoming games (on with all-final, on with no-game-today, off)
- Key visual flags (`colored`, `shadeRows`, `highlightWinners`, league separators)
- NCAA rankings
- Broadcast hiding
- Multi-sport (NFL + NHL + MLB simultaneously)

## Running the tests

### One-time setup

```sh
npm ci
node --run test:e2e:install      # clones MagicMirror + installs Playwright Chromium
```

### Daily use

```sh
node --run lint                   # ESLint
node --run test:unit              # unit tests (~30 s)
node --run test:e2e               # curated matrix — 25 scenarios (~1–2 min)
node --run test                   # all of the above
```

### Matrix modes

The Playwright matrix runs in one of three modes — pick via the `MATRIX_MODE`
env var or the convenience npm scripts:

| Mode | Scenarios | Script | When to use |
|---|---|---|---|
| `curated` (default) | 25 | `node --run test:e2e` | Day-to-day CI, PR review. Hand-picked coverage of every viewStyle, key flag, PR #198 upcoming games, broadcasts, baseball detail. |
| `pairwise` | 15 | `node --run test:e2e:pairwise` | Deeper coverage without the cost of full cartesian. Every pair of parameter values appears in at least one scenario. Deterministic (seeded). |
| `full` | 224 | `node --run test:e2e:full` | Exhaustive cartesian product of all parameter values. Slow (~10 min). Reserve for major releases. |

The parameter set for `pairwise` and `full` lives in
`tests/e2e/scenarios/_pairwise.js` — add or remove values there to widen
or narrow coverage.

### Iterating on a single Playwright scenario

```sh
node --run test:e2e -- --grep viewstyle-largeLogos
```

Screenshots land in `test-results/screenshots/`.

### Updating screenshots after CSS changes

The current matrix takes plain (non-comparison) screenshots — there is no
baseline snapshot diff. To compare visually, eyeball-review the PNGs in
`test-results/screenshots/`. If you want to add snapshot diffing, replace
`region.screenshot({ path: ... })` with `expect(region).toHaveScreenshot()`
in `tests/e2e/specs/matrix.spec.js`.

### Verbose Playwright / MagicMirror logs

```sh
MM_VERBOSE=1 node --run test:e2e
```

## How the E2E pipeline works

```
   Playwright spec
         │
         │ for each scenario in SCENARIOS:
         │   1) wire fixture HTTP routes for this scenario
         │   2) write tests/e2e/.tmp/MagicMirror/config/config.js
         │   3) restart MagicMirror server (npm run server)
         │   4) page.goto('http://localhost:8080')
         │   5) wait for .MMM-MyScoreboard
         │   6) screenshot the .MMM-MyScoreboard region
         │   7) run scenario-specific DOM assertions
         │
   Fixture HTTP server (127.0.0.1, random port)
         │   serves recorded / synthetic JSON keyed on
         │   "<METHOD> <path><search>"
         │
   Fetch shim (NODE_OPTIONS --import)
         │   intercepts MagicMirror's outbound fetch and
         │   rewrites known provider hosts (ESPN, MLB, SNET,
         │   CPL, PWHL) to localhost:<fixturePort>.
```

## Directory layout

```
tests/
├── setup.js                          # registered via --import for unit tests
├── _stubs/                           # logger / node_helper stubs
├── helpers/                          # mock-fetch, time-control, load-frontend
├── unit/                             # node:test files
├── e2e/
│   ├── playwright.config.js
│   ├── fixtures/http-server.js
│   ├── mm-bootstrap/                 # install-mm.mjs, fetch-shim.js, start-mm.js, config-builder.js
│   ├── scenarios/                    # one file per scenario
│   └── specs/matrix.spec.js
└── fixtures/                         # captured / synthetic JSON
```

## CI

`.github/workflows/test.yaml` runs three jobs on push and PR:

- `lint` — ESLint (existing)
- `unit` — `node --run test:unit`
- `e2e` — installs MagicMirror, runs Playwright matrix, uploads
  `screenshots/` and `playwright-report/` as artifacts (14-day retention)

Both `test-results/screenshots/` and the Playwright HTML report are
attached to every CI run, so reviewers can download and inspect the
rendered output without running the tests locally.

## Adding a new E2E scenario

1. Create `tests/e2e/scenarios/<name>.js`:
   ```js
   const { espnScoreboardRoute, makeFinalGame, TEAMS } = require('./_shared')
   module.exports = {
     name: '<name>',
     moduleConfig: { /* MagicMirror module config */ },
     fixtures: { /* URL → fixture JSON */ },
     assertions: [/* async (page, expect) => ... */],
   }
   ```
2. Add it to the array in `tests/e2e/scenarios/_index.js`.
3. Run `node --run test:e2e -- --grep <name>` and verify the screenshot.
