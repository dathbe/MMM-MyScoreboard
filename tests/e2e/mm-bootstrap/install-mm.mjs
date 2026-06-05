#!/usr/bin/env node
/*
  Install MagicMirror into tests/e2e/.tmp/MagicMirror and link this module.

  Strategy: clone the repo at a pinned tag, run `npm ci --omit=optional`,
  then copy this repo's contents into MagicMirror/modules/MMM-MyScoreboard.
  Idempotent — re-running skips clone/install if the marker file exists.
*/

import { execSync } from 'node:child_process'
import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

const MM_REF = process.env.MM_REF ?? 'v2.36.0'
const REPO_ROOT = path.resolve(__dirname, '../../..')
const TMP_DIR = path.resolve(REPO_ROOT, 'tests/e2e/.tmp')
const MM_DIR = path.resolve(TMP_DIR, 'MagicMirror')
const MARKER = path.resolve(MM_DIR, '.mm-bootstrap-complete')
const MODULE_TARGET = path.resolve(MM_DIR, 'modules/MMM-MyScoreboard')

function sh(cmd, opts = {}) {
  console.log(`$ ${cmd}`)
  execSync(cmd, { stdio: 'inherit', ...opts })
}

function copyModuleSources() {
  // Copy everything from REPO_ROOT into MODULE_TARGET except node_modules,
  // tests/e2e/.tmp (recursion!), .git, package-lock.json.
  fs.mkdirSync(MODULE_TARGET, { recursive: true })
  const SKIP = new Set([
    'node_modules', '.git', '.github', 'tests', 'logos_custom',
  ])
  function walk(srcDir, dstDir) {
    for (const entry of fs.readdirSync(srcDir, { withFileTypes: true })) {
      if (SKIP.has(entry.name)) continue
      if (entry.name.startsWith('.tmp')) continue
      const s = path.join(srcDir, entry.name)
      const d = path.join(dstDir, entry.name)
      if (entry.isDirectory()) {
        fs.mkdirSync(d, { recursive: true })
        walk(s, d)
      }
      else {
        fs.copyFileSync(s, d)
      }
    }
  }
  walk(REPO_ROOT, MODULE_TARGET)

  // Module needs its own node_modules. We `npm install --omit=dev` inside it.
  sh('npm install --omit=dev --no-audit --no-fund', { cwd: MODULE_TARGET })
}

function main() {
  if (fs.existsSync(MARKER)) {
    console.log(`[install-mm] reusing MagicMirror at ${MM_DIR}`)
    // Always re-sync module sources — they may have changed.
    if (fs.existsSync(MODULE_TARGET)) {
      fs.rmSync(MODULE_TARGET, { recursive: true, force: true })
    }
    copyModuleSources()
    return
  }

  fs.mkdirSync(TMP_DIR, { recursive: true })

  if (!fs.existsSync(MM_DIR)) {
    sh(`git clone --depth 1 --branch ${MM_REF} https://github.com/MagicMirrorOrg/MagicMirror "${MM_DIR}"`)
  }

  // MM ships with package-lock.json; npm ci is fastest.
  sh('npm ci --omit=optional --no-audit --no-fund', { cwd: MM_DIR })

  copyModuleSources()

  fs.writeFileSync(MARKER, new Date().toISOString())
  console.log(`[install-mm] complete at ${MM_DIR}`)
}

main()
