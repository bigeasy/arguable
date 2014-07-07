var stream = require('stream'),
    arguable = require('./.'),
    __slice = [].slice

function createStream (s) {
    return s || new stream.PassThrough
}

module.exports = function (module, program) {
    var run = module.exports = function () {
        var vargs = __slice.apply(arguments),
            callback = (typeof vargs[vargs.length - 1] == 'function') && vargs.pop(),
            argv = vargs.shift(),
            options = vargs.shift() || {},
            io = {
                stdout: createStream(options.stdout),
                stdin: createStream(options.stdin),
                stderr: createStream(options.stderr)
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
        run(process.argv.slice(2), process.stdout, process.stdin, process.stderr)
    }
}
