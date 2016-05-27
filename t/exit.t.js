#!/usr/bin/env node

require('proof')(9, function (assert) {
    var exit = require('../exit'),
        events = require('events'),
        stream = require('stream'),
        interrupt = require('interrupt').createInterrupter('bigeasy.arguable')

    // rethrow an exception
    try {
        exit(null)(new Error('propagated'))
    } catch (e) {
        assert(e.message, 'propagated', 'propagated')
    }

    // set exit code for when when exit time come
    var process = new events.EventEmitter
    exit(process)(null, 0xaa)
    assert(process.exitCode, 0xaa, 'exit code set')

    process.stderr = new stream.PassThrough
    exit(process)(interrupt(new Error('abend'), { code: 0x77, stderr: 'abended' }))
    assert(process.stderr.read().toString(), 'abended\n', 'abend error message')
    assert(process.exitCode, 0x77, 'abend exit code')
    process.stdout = new stream.PassThrough
    exit(process)(interrupt(new Error('help'), { stdout: 'usage' }))
    assert(process.stdout.read().toString(), 'usage\n', 'help message')
    assert(process.exitCode, 0, 'help exit code')
    process.stdout = new stream.PassThrough
    exit(process)(interrupt(new Error('abend'), {}))
    assert(process.stdout.read(), null, 'no message')
    assert(process.exitCode, 1, 'no exit code')
    exit(process)(null)
    assert(process.exitCode, 1, 'exit code with no error')
})
