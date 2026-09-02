'use strict'

/*
  Regression test for issue #204 — "Rollover Hours Failing".

  Past rolloverHours the module clears yesterday's games (sportsDataYd), but the
  clear used to happen with no accompanying updateDom(). The updateDom() earlier
  in the SCORE-UPDATE handler only fires when *today's* data changed, so when a
  poll arrived with unchanged today data the stale yesterday scores stayed on
  screen until the next change (a team playing again) or midnight.

  The fix re-renders when it actually clears yesterday. These tests drive the
  socket handler with UNCHANGED today data (dataChanged === false) so the only
  thing that can trigger a re-render is the rollover clear itself.
*/

const { describe, it } = require('node:test')
const assert = require('node:assert/strict')
const path = require('node:path')

const { loadFrontend, makeInstance } = require(path.resolve(__dirname, '../../helpers/load-frontend'))

const LABEL = 'NHL'
const SCORES = [{ hTeam: 'TOR', vTeam: 'MTL', hScore: 1, vScore: 0, gameMode: 2 }]

// Build a SCORE-UPDATE whose scores match what's already cached, so dataChanged
// is false and the pre-existing updateDom() path stays dormant.
function unchangedUpdate(identifier) {
  return {
    instanceId: identifier,
    label: LABEL,
    index: LABEL,
    sortIdx: 0,
    scores: SCORES,
  }
}

function freshInstance(def, rolloverHours) {
  return makeInstance(def, {
    identifier: 'm1',
    config: { rolloverHours },
    sportsData: { [LABEL]: { scores: SCORES, league: LABEL, sortIdx: 0 } },
    sportsDataYd: { [LABEL]: { scores: SCORES, league: LABEL, sortIdx: 0 } },
  })
}

describe('rollover clear re-renders (issue #204)', () => {
  it('past rolloverHours: clears yesterday AND re-renders even when today is unchanged', () => {
    const { def } = loadFrontend()
    // rolloverHours: 0 → current hour (0-23) is always >= 0 → always "past rollover".
    const inst = freshInstance(def, 0)

    inst.socketNotificationReceived('MMM-MYSCOREBOARD-SCORE-UPDATE', unchangedUpdate(inst.instanceId))

    assert.deepEqual(inst.sportsDataYd, {}, 'yesterday scores should be cleared')
    assert.ok(inst.domUpdated >= 1, 'updateDom() should fire after clearing yesterday')
  })

  it('before rolloverHours: keeps yesterday and does not re-render on unchanged data', () => {
    const { def } = loadFrontend()
    // rolloverHours: 24 → hour() maxes at 23, never >= 24 → never "past rollover".
    const inst = freshInstance(def, 24)

    inst.socketNotificationReceived('MMM-MYSCOREBOARD-SCORE-UPDATE', unchangedUpdate(inst.instanceId))

    assert.ok(inst.sportsDataYd[LABEL], 'yesterday scores should be retained before rollover')
    assert.equal(inst.domUpdated, 0, 'no re-render when nothing changed and not past rollover')
  })

  it('past rolloverHours but already empty: no redundant re-render', () => {
    const { def } = loadFrontend()
    const inst = makeInstance(def, {
      identifier: 'm1',
      config: { rolloverHours: 0 },
      sportsData: { [LABEL]: { scores: SCORES, league: LABEL, sortIdx: 0 } },
      sportsDataYd: {}, // already cleared
    })

    inst.socketNotificationReceived('MMM-MYSCOREBOARD-SCORE-UPDATE', unchangedUpdate(inst.instanceId))

    assert.deepEqual(inst.sportsDataYd, {})
    assert.equal(inst.domUpdated, 0, 'should not re-render when yesterday is already empty')
  })
})
