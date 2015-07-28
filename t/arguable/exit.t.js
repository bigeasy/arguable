#!/usr/bin/env node

require('proof')(6, function (assert) {
    var exit = require('../../exit'),
        events = require('events'),
        stream = require('stream'),
        interrupt = require('../../interrupt')

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

    process.exit = function (code) {
        assert(code, 0x77, 'abend exit code')
    }
    process.stderr = new stream.PassThrough
    exit(process)(interrupt.error(new Error, 'abend', { code: 0x77, message: 'abended' }))
    process.emit('exit')
    assert(process.stderr.read().toString(), 'abended\n', 'abend error message')
    process.exit = function (code) {
        assert(code, 0, 'help exit code')
    }
    process.stdout = new stream.PassThrough
    exit(process)(interrupt.error(new Error, 'help', { message: 'usage' }))
    process.emit('exit')
    assert(process.stdout.read().toString(), 'usage\n', 'help message')
})
