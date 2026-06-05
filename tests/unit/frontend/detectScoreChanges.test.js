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
})
