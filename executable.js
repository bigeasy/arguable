var stream = require('stream'),
    redux = require('./redux'),
    propagate = require('./propagate'),
    slice = [].slice

function createStream (s) {
    return s || new stream.PassThrough
}

module.exports = function (module, source, program) {
    if (typeof source == 'function') {
        program = source
        source = module.filename
    }
    var run = module.exports = function (env, argv, options, callback) {
        var io = {
            stdout: createStream(options.stdout),
            stdin: createStream(options.stdin),
            stderr: createStream(options.stderr)
        }
        redux(source, env, argv, io, program, callback)
        return io
    }
    if (module === require.main) {
        run(process.env, process.argv.slice(2), {
            stdout: process.stdout,
            stdin: process.stdin,
            stderr: process.stderr
        }, propagate)
    }
}
