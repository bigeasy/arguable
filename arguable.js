var stream = require('stream'),
    events = require('events'),
    createProgram = require('./program'),
    exit = require('./exit'),
    slice = [].slice

function createStream (s) {
    return s || new stream.PassThrough
}

module.exports = function (module, source, program) {
    if (typeof source == 'function') {
        program = source
        source = module.filename
    }
    var invoke = module.exports = function (env, argv, options, callback) {
        var send = options.send || options.events && options.events.send && function () {
            options.events.send.apply(options.events, slice.call(arguments))
        }
        var io = {
            stdout: createStream(options.stdout),
            stdin: createStream(options.stdin),
            stderr: createStream(options.stderr),
            events: options.events || new events.EventEmitter,
            send: send || null
        }
        createProgram(source, env, argv, io, program, callback)
        return io
    }
    if (module === process.mainModule) {
        invoke(process.env, process.argv.slice(2), {
// No. Stop! There is no `process.stdio`. Do not addd one. (Again.)
            stdout: process.stdout,
            stdin: process.stdin,
            stderr: process.stderr,
            events: process
        }, exit(process))
    }
}
