'use strict'

const path = require('node:path')

module.exports = {
  testDir: path.resolve(__dirname, 'specs'),
  timeout: 90_000,
  expect: { timeout: 10_000 },
  fullyParallel: false,
  retries: process.env.CI ? 1 : 0,
  workers: 1,
  reporter: [
    ['html', { outputFolder: path.resolve(__dirname, '../../playwright-report'), open: 'never' }],
    ['list'],
  ],
  outputDir: path.resolve(__dirname, '../../test-results'),
  use: {
    viewport: { width: 1920, height: 1080 },
    screenshot: 'only-on-failure',
    trace: 'retain-on-failure',
    video: 'off',
  },
}
