#!/usr/bin/env node

require('proof')(1, function (assert) {
    var propagate = require('../../propagate')
    try {
        propagate(new Error('propagated'))
    } catch (e) {
        assert(e.message, 'propagated', 'propagated')
    }
})
