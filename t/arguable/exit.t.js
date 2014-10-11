#!/usr/bin/env node

require('proof')(2, function (assert) {
    var exit = require('../../exit'),
        events = require('events')

    // rethrow an exception
    try {
        exit(null)(new Error('propagated'))
    } catch (e) {
        assert(e.message, 'propagated', 'propagated')
    }

    // set exit code for when when exit time come
    var process = new events.EventEmitter
    process.exit = function (code) {
        assert(code, 0xaa, 'exit code set')
    }
    exit(process)(null, 0xaa)
    process.emit('exit')
})
