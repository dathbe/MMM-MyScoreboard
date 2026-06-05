'use strict'

const { describe, it, beforeEach } = require('node:test')
const assert = require('node:assert/strict')
const path = require('node:path')

const helperModule = require(path.resolve(__dirname, '../../../node_helper.js'))

/*
  PR #198 — MMM-MYSCOREBOARD-GET-UPCOMING dispatch.

  Our stub `node_helper.create()` returns the descriptor object as-is and
  attaches a `sendSocketNotification` that calls `onSocketNotificationSent`
  if defined. Tests inject a spy via that hook.
*/

function makeSpy() {
  const calls = []
  return {
    fn: (notification, payload) => calls.push({ notification, payload }),
    calls,
  }
}

describe('node_helper MMM-MYSCOREBOARD-GET-UPCOMING dispatch', () => {
  let spy

  beforeEach(() => {
    spy = makeSpy()
    helperModule.onSocketNotificationSent = spy.fn
    helperModule.providers = {}
  })

  it('unsupported provider → sends UPCOMING-UPDATE with unsupported:true', async () => {
    helperModule.providers.CPL = { /* no getTeamSchedule */ }

    await helperModule.socketNotificationReceived('MMM-MYSCOREBOARD-GET-UPCOMING', {
      provider: 'CPL',
      league: 'CPL',
      teams: ['FFC'],
      instanceId: 'instance-1',
      label: 'CPL',
      sortIdx: 0,
    })

    assert.equal(spy.calls.length, 1)
    assert.equal(spy.calls[0].notification, 'MMM-MYSCOREBOARD-UPCOMING-UPDATE')
    assert.equal(spy.calls[0].payload.unsupported, true)
    assert.deepEqual(spy.calls[0].payload.games, {})
    assert.equal(spy.calls[0].payload.instanceId, 'instance-1')
    assert.equal(spy.calls[0].payload.label, 'CPL')
  })

  it('missing provider key → unsupported:true', async () => {
    await helperModule.socketNotificationReceived('MMM-MYSCOREBOARD-GET-UPCOMING', {
      provider: 'UNKNOWN',
      league: 'NHL',
      teams: ['TOR'],
      instanceId: 'i',
      label: 'NHL',
      sortIdx: 0,
    })

    assert.equal(spy.calls[0].payload.unsupported, true)
  })

  it('provider with getTeamSchedule → forwards games and sends UPDATE', async () => {
    const FAKE_GAMES = { TOR: { hTeam: 'TOR', vTeam: 'MTL' } }
    helperModule.providers.ESPN = {
      getTeamSchedule(payload, cb) {
        cb(FAKE_GAMES, payload)
      },
    }

    await helperModule.socketNotificationReceived('MMM-MYSCOREBOARD-GET-UPCOMING', {
      provider: 'ESPN',
      league: 'NHL',
      teams: ['TOR'],
      instanceId: 'i2',
      label: 'NHL',
      sortIdx: 3,
    })

    assert.equal(spy.calls.length, 1)
    const p = spy.calls[0].payload
    assert.equal(p.unsupported, undefined)
    assert.equal(p.label, 'NHL')
    assert.equal(p.sortIdx, 3)
    assert.deepEqual(p.games, FAKE_GAMES)
  })

  it('forwards league + instanceId in response payload', async () => {
    helperModule.providers.ESPN = {
      getTeamSchedule(payload, cb) {
        cb({}, payload)
      },
    }

    await helperModule.socketNotificationReceived('MMM-MYSCOREBOARD-GET-UPCOMING', {
      provider: 'ESPN',
      league: 'NBA',
      teams: ['LAL'],
      instanceId: 'inst-99',
      label: 'NBA',
      sortIdx: 1,
    })

    assert.equal(spy.calls[0].payload.league, 'NBA')
    assert.equal(spy.calls[0].payload.instanceId, 'inst-99')
  })
})
