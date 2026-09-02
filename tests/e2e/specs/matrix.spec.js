'use strict'

const { test, expect } = require('@playwright/test')
const fs = require('node:fs')
const path = require('node:path')

const { SCENARIOS } = require('../scenarios/_index')
const { buildConfig } = require('../mm-bootstrap/config-builder')
const { startFixtureServer } = require('../fixtures/http-server')
const { startMM, waitForPortFree } = require('../mm-bootstrap/start-mm.js')

const REPO_ROOT = path.resolve(__dirname, '../../..')
const MM_DIR = path.resolve(REPO_ROOT, 'tests/e2e/.tmp/MagicMirror')
const MM_CONFIG = path.resolve(MM_DIR, 'config/config.js')
const SCREENSHOT_DIR = path.resolve(REPO_ROOT, 'test-results/screenshots')
const MM_PORT = parseInt(process.env.MM_PORT ?? '8080', 10)

let fixtureSrv
let mmProc

test.beforeAll(async () => {
  fs.mkdirSync(SCREENSHOT_DIR, { recursive: true })
  fixtureSrv = await startFixtureServer(0)
})

test.afterAll(async () => {
  if (mmProc) await mmProc.stop().catch(() => {})
  if (fixtureSrv) await fixtureSrv.close().catch(() => {})
})

let scenarioIdx = 0
for (const scenario of SCENARIOS) {
  // Unique port per scenario: a page from a finished test can outlive its
  // teardown for a moment, and its socket.io client auto-reconnects to
  // whatever is listening on the old port. With a shared port that zombie
  // (carrying stale noGamesToday/ydLoaded latches) reaches the NEXT
  // scenario's MM, and the helper's replies — addressed by an instanceId
  // that is identical on every page — wipe the live page's data.
  const scenarioPort = MM_PORT + (scenarioIdx++ % 100)
  test(scenario.name, async ({ page }) => {
    // Wire fixtures for this scenario.
    fixtureSrv.setRoutes(scenario.fixtures ?? {})

    // Write a config.js for MagicMirror.
    // Before 3 AM local the module's rolloverHours logic requests
    // yesterday's date, but fixtures are keyed to today — shift the module
    // clock past the rollover window so the suite passes at any hour.
    const rolloverShim = new Date().getHours() < 3 ? { debugHours: 4 } : {}
    const cfg = buildConfig({
      ...scenario,
      moduleConfig: { ...rolloverShim, ...scenario.moduleConfig },
      port: scenarioPort,
    })
    fs.mkdirSync(path.dirname(MM_CONFIG), { recursive: true })
    fs.writeFileSync(MM_CONFIG, cfg)

    // Restart MM (cheapest way to apply new config).
    if (mmProc) {
      await mmProc.stop().catch(() => {})
      mmProc = null
    }
    await waitForPortFree(scenarioPort)
    mmProc = await startMM({
      mmDir: MM_DIR,
      fixturePort: fixtureSrv.port,
      port: scenarioPort,
    })

    await page.goto(`http://localhost:${scenarioPort}/`)
    // Wait until MagicMirror's core has actually initialized AND the module
    // rendered content (box scores) or its dimmed loading state. A bare
    // region div is not enough — pages occasionally come up with the MM
    // core half-dead (MM global missing, module never starts); reload once
    // to recover instead of asserting against a blank page.
    const moduleReady = () => page.waitForFunction(
      /* eslint-disable no-undef */
      () => {
        // MM is a lexically-scoped global (const), not window.MM
        if (typeof MM === 'undefined') return false
        if (document.querySelector('.MMM-MyScoreboard .box-score, .MMM-MyScoreboard .dimmed')) return true
        // No-games scenarios render neither — accept once data has arrived
        const m = MM.getModules().withClass('MMM-MyScoreboard')[0]
        return !!(m && m.loaded)
      },
      /* eslint-enable no-undef */
      { timeout: 8_000 },
    )
    try {
      await moduleReady()
    }
    catch {
      console.log(`[matrix] ${scenario.name}: MM not ready after goto — reloading once`)
      await page.reload()
      await moduleReady()
    }
    // Let CSS animations settle.
    await page.waitForTimeout(800)

    const region = page.locator('.MMM-MyScoreboard').first()
    await region.screenshot({
      path: path.join(SCREENSHOT_DIR, `${scenario.name}.png`),
    })

    for (const a of (scenario.assertions ?? [])) {
      try {
        await a(page, expect)
      }
      catch (e) {
        // Dump module state to the test output for flake diagnosis
        const state = await page.evaluate(() => {
          /* eslint-disable no-undef */
          const region = document.querySelector('.MMM-MyScoreboard')
          const base = {
            url: location.href,
            readyState: document.readyState,
            hasMMGlobal: typeof MM !== 'undefined',
            regionPresent: !!region,
            regionHtmlLen: region ? region.innerHTML.length : -1,
            bodyLen: document.body ? document.body.innerHTML.length : -1,
            scripts: Array.from(document.querySelectorAll('script')).length,
          }
          const m = typeof MM !== 'undefined' && MM.getModules().withClass('MMM-MyScoreboard')[0]
          if (!m) return { ...base, module: 'not found' }
          return {
            ...base,
            loaded: m.loaded,
            handshakePending: m.localLogoRetryTimer !== null,
            sportsDataKeys: Object.keys(m.sportsData || {}),
            sportsData: JSON.stringify(m.sportsData || {}).slice(0, 300),
          }
        }).catch(err => `evaluate failed: ${err}`)
        console.log(`[matrix] ${scenario.name} module state on failure:`, JSON.stringify(state))
        throw e
      }
    }
  })
}
