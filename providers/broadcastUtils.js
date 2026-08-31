'use strict'

module.exports = {
  filterSkippedChannels(channels, skipChannels) {
    if (!Array.isArray(skipChannels) || skipChannels.length === 0) {
      return channels
    }

    return channels.filter(channel => !skipChannels.includes(channel.name))
  },

  applyChannelTiers(channels, channelTiers, showUnmatchedChannels = false) {
    if (!Array.isArray(channelTiers) || channelTiers.length === 0) {
      return channels
    }

    for (const tier of channelTiers) {
      if (!Array.isArray(tier) || tier.length === 0) {
        continue
      }

      const tierChannels = channels.filter(channel => tier.includes(channel.name))
      if (tierChannels.length > 0) {
        return tierChannels
      }
    }

    return showUnmatchedChannels ? channels : []
  },
}
