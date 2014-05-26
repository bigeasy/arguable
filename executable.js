var arguable = require('./.')

module.exports = function (module, program) {
    var run = module.exports = function (argv, stdin, stdout, stderr, callback) {
        arguable.parse(module.filename, argv, function (options) {
            program(options, stdin, stdout, stderr, callback || options.fatal)
        })
    }
    if (module === require.main) {
        run(process.argv.slice(2), process.stdin, process.stdout, process.stderr)
    }
}
