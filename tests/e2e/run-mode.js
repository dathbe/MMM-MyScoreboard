#!/usr/bin/env node
/*
  Cross-platform Playwright launcher that sets MATRIX_MODE.

  Usage:
    node tests/e2e/run-mode.js [curated|pairwise|full] [extra playwright args]
*/

'use strict'

const { spawnSync } = require('node:child_process')

const mode = process.argv[2] || 'curated'
const extra = process.argv.slice(3)

const result = spawnSync('npx', ['playwright', 'test', '--config', 'tests/e2e/playwright.config.js', ...extra], {
  stdio: 'inherit',
  shell: true,
  env: { ...process.env, MATRIX_MODE: mode },
})

process.exit(result.status ?? 0)
