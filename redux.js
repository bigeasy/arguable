var slice = [].slice
var cadence = require('cadence')
var createUsage = require('./usage')
var getopt = require('./getopt')

module.exports = cadence(function (async, source, env, argv, io, main) {

    // options object and selected usage
    var options = {}, usage

    // wrap in a Cadence try/catch block
    async([function () {

        // parse usage
        usage = createUsage('en_US', source, []).usage.shift()
        if (!usage) {
            throw new Error('no usage found')
        }

        // use environment `LANG` or else language of first usage definition
        var lang = env.LANG ? env.LANG.split('.')[0] : usage.lang

        // set options object properties
        options.argv = argv = argv.slice()
        options.params = {}
        options.usage = usage.message
        options.stdout = io.stdout
        options.stderr = io.stderr
        options.stdin = io.stdin

        // abend helper stops execution and prints a message
        options.abend = function () {
            var vargs = slice.call(arguments), key = vargs.shift(), code
            if (typeof key == 'number') {
                this._code = key
                key = vargs.shift()
            } else {
                this._code = 1
            }
            var message = usage.strings[key] || { text: key, order: [] }
            var formatted = require('./format')(message, vargs)
            this._redirect = 'stderr'
            throw this._thrown = new Error(formatted)
        }
        // help helper prints stops execution and prints the help message
        options.help = function () {
            this._redirect = 'stdout'
            this._code = 0
            throw this._thrown = new Error(usage.usage)
        }
        // exit helper stops execution and exits with the given code
        options.exit = function (code) {
            this._code = code
            throw this._thrown = new Error
        }

        // parse arguments
        options.given = getopt(usage.pattern, options.params, argv, function (message) {
            options.abend(message)
        })

        // run program
        main(options, async())

    }, function (errors, error) {

        // if we threw the error, write it to the console, otherwise rethrow
        if (error === options._thrown) {

            // write message if message
            if (error.message) {
                io[options._redirect].write(error.message)
                io[options._redirect].write('\n')
            }

            // exit with error code
            return [ async, this._code ]

        } else {

            throw errors
        }

    }], function () {

        // zero exit code
        return 0

    })

})
