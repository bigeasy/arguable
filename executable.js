var stream = require('stream'),
    arguable = require('./.')

function createStream (s) {
    return s || new stream.PassThrough
}

module.exports = function (module, program) {
    var run = module.exports = function (argv, stdout, stdin, stderr, callback) {
        var io = {
            stdin: createStream(stdin),
            stdout: createStream(stdout),
            stderr: createStream(stderr)
        }
        arguable.parse(module.filename, argv, function (options) {
            options.stdin = io.stdin
            options.stdout = io.stdout
            options.stderr = io.stderr
            program(options, callback || options.fatal)
        })
        return io
    }
    if (module === require.main) {
        run(process.argv.slice(2), process.stdin, process.stdout, process.stderr)
    }
}
