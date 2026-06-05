'use strict'

// Stub for MagicMirror's `node_helper` module.
// Provides a `create()` factory that returns the descriptor object as-is, so
// tests can call the returned methods directly.

module.exports = {
  create: function (descriptor) {
    const instance = Object.assign({}, descriptor)
    // Stub MagicMirror lifecycle helpers used by node_helper.js
    instance.sendSocketNotification = function (notification, payload) {
      if (typeof instance.onSocketNotificationSent === 'function') {
        instance.onSocketNotificationSent(notification, payload)
      }
    }
    return instance
  },
}
