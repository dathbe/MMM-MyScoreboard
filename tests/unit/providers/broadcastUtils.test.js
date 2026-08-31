'use strict'

const { describe, it } = require('node:test')
const assert = require('node:assert/strict')

const broadcastUtils = require('../../../providers/broadcastUtils.js')

function channel(name) {
  return { name, display: name }
}

describe('broadcastUtils.applyChannelTiers', () => {
  const channels = [
    channel('YES'),
    channel('ESPN'),
    channel('TNT'),
    channel('ESPN Unlmtd'),
  ]

  it('preserves current behavior when channelTiers is empty', () => {
    assert.deepEqual(broadcastUtils.applyChannelTiers(channels, [], false), channels)
  })

  it('returns all available channels from the first matching tier', () => {
    const result = broadcastUtils.applyChannelTiers(
      channels,
      [['YES', 'MSG'], ['ESPN', 'TNT'], ['ESPN Unlmtd']],
      false,
    )
    assert.deepEqual(result.map(item => item.name), ['YES'])
  })

  it('keeps multiple available channels from the winning tier', () => {
    const result = broadcastUtils.applyChannelTiers(
      channels,
      [['MSG'], ['ESPN', 'TNT'], ['ESPN Unlmtd']],
      false,
    )
    assert.deepEqual(result.map(item => item.name), ['ESPN', 'TNT'])
  })

  it('uses a lower tier when higher tiers have no available channels', () => {
    const result = broadcastUtils.applyChannelTiers(
      [channel('ESPN Unlmtd')],
      [['YES'], ['ESPN'], ['ESPN Unlmtd']],
      false,
    )
    assert.deepEqual(result.map(item => item.name), ['ESPN Unlmtd'])
  })

  it('returns an empty list when no tier matches and fallback is disabled', () => {
    const result = broadcastUtils.applyChannelTiers(
      [channel('CBSSN')],
      [['YES'], ['ESPN']],
      false,
    )
    assert.deepEqual(result, [])
  })

  it('returns unmatched channels when fallback is enabled', () => {
    const unmatched = [channel('CBSSN'), channel('Peacock')]
    const result = broadcastUtils.applyChannelTiers(
      unmatched,
      [['YES'], ['ESPN']],
      true,
    )
    assert.deepEqual(result, unmatched)
  })

  it('ignores malformed and empty tier entries', () => {
    const result = broadcastUtils.applyChannelTiers(
      [channel('TNT')],
      [null, [], 'ESPN', ['TNT']],
      false,
    )
    assert.deepEqual(result.map(item => item.name), ['TNT'])
  })
})

describe('broadcastUtils.filterSkippedChannels', () => {
  it('removes skipped channels from the normalized channel list', () => {
    const channels = [
      channel('SNY'),
      channel('YES'),
      channel('ESPN'),
    ]

    const result = broadcastUtils.filterSkippedChannels(channels, ['SNY'])

    assert.deepEqual(result.map(item => item.name), ['YES', 'ESPN'])
  })

  it('does not allow unmatched fallback to resurrect a skipped channel', () => {
    const channels = [
      channel('SNY'),
      channel('CBSSN'),
    ]

    const surviving = broadcastUtils.filterSkippedChannels(channels, ['SNY'])
    const result = broadcastUtils.applyChannelTiers(
      surviving,
      [['SNY'], ['YES']],
      true,
    )

    assert.deepEqual(result.map(item => item.name), ['CBSSN'])
  })
})
