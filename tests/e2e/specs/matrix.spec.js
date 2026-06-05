'use strict'

const { test, expect } = require('@playwright/test')
const fs = require('node:fs')
const path = require('node:path')

const { SCENARIOS } = require('../scenarios/_index')
const { buildConfig } = require('../mm-bootstrap/config-builder')
const { startFixtureServer } = require('../fixtures/http-server')
const { startMM } = require('../mm-bootstrap/start-mm.js')

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

for (const scenario of SCENARIOS) {
  test(scenario.name, async ({ page }) => {
    // Wire fixtures for this scenario.
    fixtureSrv.setRoutes(scenario.fixtures ?? {})

    // Write a config.js for MagicMirror.
    const cfg = buildConfig({ ...scenario, port: MM_PORT })
    fs.mkdirSync(path.dirname(MM_CONFIG), { recursive: true })
    fs.writeFileSync(MM_CONFIG, cfg)

    // Restart MM (cheapest way to apply new config).
    if (mmProc) {
      await mmProc.stop().catch(() => {})
      mmProc = null
    }
    mmProc = await startMM({
      mmDir: MM_DIR,
      fixturePort: fixtureSrv.port,
      port: MM_PORT,
    })

    await page.goto(`http://localhost:${MM_PORT}/`)
    // Wait for either rendered scoreboard or dimmed loading state.
    await page.waitForSelector(
      '.MMM-MyScoreboard .box-score, .MMM-MyScoreboard .dimmed, .MMM-MyScoreboard',
      { timeout: 15_000 },
    )
    // Let CSS animations settle.
    await page.waitForTimeout(800)

    const region = page.locator('.MMM-MyScoreboard').first()
    await region.screenshot({
      path: path.join(SCREENSHOT_DIR, `${scenario.name}.png`),
    })

    for (const a of (scenario.assertions ?? [])) {
      await a(page, expect)
    }
  })
}
