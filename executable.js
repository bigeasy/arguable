var stream = require('stream'),
    arguable = require('./.'),
    __slice = [].slice

function createStream (s) {
    return s || new stream.PassThrough
}

module.exports = function (module, program) {
    var run = module.exports = function (argv, stdout, stdin, stderr, callback) {
        var vargs = __slice.apply(arguments),
            callback = (typeof vargs[vargs.length - 1] == 'function') && vargs.pop(),
            argv = vargs.shift() || [],
            io = {
                stdout: createStream(vargs.shift()),
                stdin: createStream(vargs.shift()),
                stderr: createStream(vargs.shift())
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
