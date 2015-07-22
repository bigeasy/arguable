var stream = require('stream'),
    events = require('events'),
    run = require('./run'),
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
        var io = {
            stdout: createStream(options.stdout),
            stdin: createStream(options.stdin),
            stderr: createStream(options.stderr),
            events: new events.EventEmitter
        }
        run(source, env, argv, io, program, callback)
        return io
    }
    if (module === require.main) {
        invoke(process.env, process.argv.slice(2), {
            stdout: process.stdout,
            stdin: process.stdin,
            stderr: process.stderr
        }, exit(process))
    }
}
