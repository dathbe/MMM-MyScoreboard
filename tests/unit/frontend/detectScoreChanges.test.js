'use strict'

const { describe, it, before } = require('node:test')
const assert = require('node:assert/strict')

const { loadFrontend, makeInstance } = require('../../helpers/load-frontend')

let def
before(() => {
  def = loadFrontend().def
})

const gameModes = { SCHEDULED: 0, IN_PROGRESS: 1, FINAL: 2 }

function game(opts) {
  return {
    hTeam: opts.h,
    vTeam: opts.v,
    hScore: opts.hScore,
    vScore: opts.vScore,
    gameMode: opts.gameMode,
  }
}

describe('detectScoreChanges', () => {
  function setup() {
    const inst = makeInstance(def, {
      config: { showScoreAnimation: true },
      followedTeams: { NHL: ['TOR'] },
    })
    inst.gameModes = gameModes
    inst.scoreAnimations = {}
    inst.animationBlockUntil = 0
    return inst
  }

  it('home followed team scores → score animation, blocks 4s', () => {
    const inst = setup()
    const before = Date.now()
    inst.detectScoreChanges('NHL',
      [game({ h: 'TOR', v: 'MTL', hScore: 0, vScore: 0, gameMode: 1 })],
      [game({ h: 'TOR', v: 'MTL', hScore: 1, vScore: 0, gameMode: 1 })])
    const key = 'NHL:MTL@TOR'
    assert.deepEqual(inst.scoreAnimations[key], { type: 'score', team: 'home' })
    assert.ok(inst.animationBlockUntil >= before + 4000)
    assert.ok(inst.animationBlockUntil <= Date.now() + 4000)
  })

  it('visitor followed team scores → score animation', () => {
    const inst = setup()
    inst.followedTeams.NHL = ['MTL']
    inst.detectScoreChanges('NHL',
      [game({ h: 'TOR', v: 'MTL', hScore: 0, vScore: 0, gameMode: 1 })],
      [game({ h: 'TOR', v: 'MTL', hScore: 0, vScore: 1, gameMode: 1 })])
    assert.deepEqual(inst.scoreAnimations['NHL:MTL@TOR'], { type: 'score', team: 'visitor' })
  })

  it('non-followed team scores → no animation, no block', () => {
    const inst = setup()
    inst.detectScoreChanges('NHL',
      [game({ h: 'MTL', v: 'BOS', hScore: 0, vScore: 0, gameMode: 1 })],
      [game({ h: 'MTL', v: 'BOS', hScore: 1, vScore: 0, gameMode: 1 })])
    assert.equal(Object.keys(inst.scoreAnimations).length, 0)
    assert.equal(inst.animationBlockUntil, 0)
  })

  it('followed team wins → win animation, blocks 8.5s', () => {
    const inst = setup()
    const before = Date.now()
    inst.detectScoreChanges('NHL',
      [game({ h: 'TOR', v: 'MTL', hScore: 4, vScore: 2, gameMode: 1 })],
      [game({ h: 'TOR', v: 'MTL', hScore: 4, vScore: 2, gameMode: 2 })])
    assert.deepEqual(inst.scoreAnimations['NHL:MTL@TOR'], { type: 'win' })
    assert.ok(inst.animationBlockUntil >= before + 8500)
  })

  it('followed team loses → no win animation', () => {
    const inst = setup()
    inst.detectScoreChanges('NHL',
      [game({ h: 'TOR', v: 'MTL', hScore: 2, vScore: 4, gameMode: 1 })],
      [game({ h: 'TOR', v: 'MTL', hScore: 2, vScore: 4, gameMode: 2 })])
    assert.equal(inst.scoreAnimations['NHL:MTL@TOR'], undefined)
    assert.equal(inst.animationBlockUntil, 0)
  })

  it('win animation overwrites prior score animation, extends block window', () => {
    const inst = setup()
    inst.detectScoreChanges('NHL',
      [game({ h: 'TOR', v: 'MTL', hScore: 0, vScore: 0, gameMode: 1 })],
      [game({ h: 'TOR', v: 'MTL', hScore: 1, vScore: 0, gameMode: 1 })])
    const afterScoreBlock = inst.animationBlockUntil
    inst.detectScoreChanges('NHL',
      [game({ h: 'TOR', v: 'MTL', hScore: 1, vScore: 0, gameMode: 1 })],
      [game({ h: 'TOR', v: 'MTL', hScore: 1, vScore: 0, gameMode: 2 })])
    assert.deepEqual(inst.scoreAnimations['NHL:MTL@TOR'], { type: 'win' })
    assert.ok(inst.animationBlockUntil > afterScoreBlock)
  })

  it('non-final → final without score change still triggers win when followed leads', () => {
    const inst = setup()
    inst.detectScoreChanges('NHL',
      [game({ h: 'TOR', v: 'MTL', hScore: 3, vScore: 1, gameMode: 1 })],
      [game({ h: 'TOR', v: 'MTL', hScore: 3, vScore: 1, gameMode: 2 })])
    assert.deepEqual(inst.scoreAnimations['NHL:MTL@TOR'], { type: 'win' })
  })

  it('returns silently when followedTeams[label] missing', () => {
    const inst = setup()
    delete inst.followedTeams.NHL
    inst.detectScoreChanges('NHL',
      [game({ h: 'TOR', v: 'MTL', hScore: 0, vScore: 0, gameMode: 1 })],
      [game({ h: 'TOR', v: 'MTL', hScore: 1, vScore: 0, gameMode: 1 })])
    assert.equal(Object.keys(inst.scoreAnimations).length, 0)
  })

  it('new game with no matching old game is skipped', () => {
    const inst = setup()
    inst.detectScoreChanges('NHL',
      [],
      [game({ h: 'TOR', v: 'MTL', hScore: 1, vScore: 0, gameMode: 1 })])
    assert.equal(Object.keys(inst.scoreAnimations).length, 0)
  })

  it('broadcasts no events by default', () => {
    const inst = setup()
    inst.detectScoreChanges('NHL',
      [game({ h: 'TOR', v: 'MTL', hScore: 3, vScore: 1, gameMode: 1 })],
      [game({ h: 'TOR', v: 'MTL', hScore: 3, vScore: 1, gameMode: 2 })],
      'NHL')
    assert.deepEqual(inst.broadcastNotifications, [])
  })

  it('broadcasts a neutral final event for a followed team', () => {
    const inst = setup()
    inst.config.gameEventNotifications = { enabled: true, events: ['game.final'] }
    const oldGame = game({ h: 'TOR', v: 'MTL', hScore: 3, vScore: 1, gameMode: 1 })
    const newGame = Object.assign(
      game({ h: 'TOR', v: 'MTL', hScore: 3, vScore: 1, gameMode: 2 }),
      { hTeamLong: 'Toronto Maple Leafs', vTeamLong: 'Montreal Canadiens', status: ['Final'] },
    )
    inst.followedTeams.Hockey = ['TOR']

    inst.detectScoreChanges('Hockey', [oldGame], [newGame], 'NHL')

    assert.equal(inst.broadcastNotifications.length, 1)
    assert.equal(inst.broadcastNotifications[0].notification, 'MYSCOREBOARD_GAME_EVENT')
    assert.deepEqual(inst.broadcastNotifications[0].payload, {
      event: 'game.final',
      league: 'NHL',
      label: 'Hockey',
      gameId: 'NHL:MTL@TOR',
      timestamp: inst.broadcastNotifications[0].payload.timestamp,
      home: { name: 'Toronto Maple Leafs', abbreviation: 'TOR', score: 3 },
      away: { name: 'Montreal Canadiens', abbreviation: 'MTL', score: 1 },
      followedTeams: ['TOR'],
      status: 'Final',
      result: 'win',
    })
  })

  it('broadcasts when a followed team game starts', () => {
    const inst = setup()
    inst.config.showScoreAnimation = false
    inst.config.gameEventNotifications = { enabled: true, events: ['game.started'] }

    inst.detectScoreChanges('NHL',
      [game({ h: 'TOR', v: 'MTL', hScore: 0, vScore: 0, gameMode: 0 })],
      [game({ h: 'TOR', v: 'MTL', hScore: 0, vScore: 0, gameMode: 1 })],
      'NHL')

    assert.equal(inst.broadcastNotifications.length, 1)
    assert.equal(inst.broadcastNotifications[0].payload.event, 'game.started')
  })

  it('broadcasts halftime once without broadcasting every score', () => {
    const inst = setup()
    inst.config.showScoreAnimation = false
    inst.config.gameEventNotifications = { enabled: true, events: ['game.halftime'] }
    const oldGame = Object.assign(
      game({ h: 'TOR', v: 'MTL', hScore: 48, vScore: 44, gameMode: 1 }),
      { status: ['2nd 0:02'] },
    )
    const halftime = Object.assign(
      game({ h: 'TOR', v: 'MTL', hScore: 50, vScore: 44, gameMode: 1 }),
      { status: ['Halftime'] },
    )

    inst.detectScoreChanges('NHL', [oldGame], [halftime], 'NBA')
    inst.detectScoreChanges('NHL', [halftime], [halftime], 'NBA')

    assert.equal(inst.broadcastNotifications.length, 1)
    assert.equal(inst.broadcastNotifications[0].payload.event, 'game.halftime')
    assert.equal(inst.broadcastNotifications[0].payload.checkpoint, 'halftime')
  })

  it('supports opt-in score events for low-scoring sports', () => {
    const inst = setup()
    inst.config.showScoreAnimation = false
    inst.config.gameEventNotifications = { enabled: true, events: ['game.score'] }

    inst.detectScoreChanges('NHL',
      [game({ h: 'TOR', v: 'MTL', hScore: 0, vScore: 0, gameMode: 1 })],
      [game({ h: 'TOR', v: 'MTL', hScore: 1, vScore: 0, gameMode: 1 })],
      'NHL')

    assert.equal(inst.broadcastNotifications.length, 1)
    assert.equal(inst.broadcastNotifications[0].payload.event, 'game.score')
    assert.equal(inst.broadcastNotifications[0].payload.scoringTeam, 'TOR')
  })

  it('detects broadcasts from score updates when animations are disabled', () => {
    const inst = makeInstance(def, {
      identifier: 'scoreboard-1',
      config: {
        rolloverHours: 24,
        showScoreAnimation: false,
        gameEventNotifications: { enabled: true, events: ['game.final'] },
      },
      followedTeams: { NHL: ['TOR'] },
      sportsData: {
        NHL: {
          scores: [game({ h: 'TOR', v: 'MTL', hScore: 3, vScore: 1, gameMode: 1 })],
          league: 'NHL',
          sortIdx: 0,
        },
      },
    })
    inst.gameModes = gameModes

    inst.socketNotificationReceived('MMM-MYSCOREBOARD-SCORE-UPDATE', {
      instanceId: 'scoreboard-1',
      label: 'NHL',
      index: 'NHL',
      sortIdx: 0,
      scores: [game({ h: 'TOR', v: 'MTL', hScore: 3, vScore: 1, gameMode: 2 })],
    })

    assert.equal(inst.broadcastNotifications.length, 1)
    assert.equal(inst.broadcastNotifications[0].payload.event, 'game.final')
    assert.deepEqual(inst.scoreAnimations, {})
  })
})
