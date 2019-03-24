require('proof')(7, prove)

function prove (okay) {
    var exit = require('../exit'),
        events = require('events'),
        stream = require('stream'),
        Interrupt = require('interrupt').createInterrupter('bigeasy.arguable')

    // rethrow an exception
    try {
        exit(null)(new Error('propagated'))
    } catch (e) {
        okay(e.message, 'propagated', 'propagated')
    }

    // set exit code for when when exit time come
    var process = new events.EventEmitter
    exit(process)(null, 0xaa)
    okay(process.exitCode, 0xaa, 'exit code set')

    process.stderr = new stream.PassThrough
    exit(process)(new Interrupt('abend', { exitCode: 0x77, stderr: 'abended' }))
    okay(process.stderr.read().toString(), 'abended\n', 'abend error message')
    okay(process.exitCode, 0x77, 'abend exit code')
    process.stdout = new stream.PassThrough
    exit(process)(new Interrupt('abend', { stdout: 'usage', exitCode: 0 }))
    okay(process.stdout.read().toString(), 'usage\n', 'help message')
    okay(process.exitCode, 0, 'help exit code')
    process.stdout = new stream.PassThrough
    exit(process)(new Interrupt('abend'))
    okay(process.stdout.read(), null, 'no message')
}
