var util = require('util'),
    cadence = require('cadence/redux'),
    slice = [].slice
var createUsage = require('./usage')
var getopt = require('./getopt')

module.exports = cadence(function (async, source, env, argv, io, main) {

    // options object and selected usage
    var options = {}, usage

    // wrap in a Cadence try/catch block
    var block = async([function () {

        // parse usage
        var usage = createUsage(source)
        if (!usage.usage.length) {
            throw new Error('no usage found')
        }

        // use environment `LANG` or else language of first usage definition
        var lang = env.LANG ? env.LANG.split('.')[0] : usage.usage[0].lang

        // see if the first argument is a sub-command
        var command = usage.commands[argv[0]] ? argv.shift() : null

        // pick a language for round these parts, null if no such command
        var l10n = usage.chooseUsage(command, lang)

        // set options object properties
        options.command = command
        options.argv = argv = argv.slice()
        options.params = {}
        options.usage = l10n && l10n.usage
        options.stdout = io.stdout
        options.stderr = io.stderr
        options.stdin = io.stdin
        options.events = io.events

        // format messages using strings.
        options.format = function () {
            var vargs = slice.call(arguments), key = vargs.shift()
            var message = usage.chooseString(this.command, lang, key) || { text: key, order: [] }
            var ordered = []
            for (var i = 0; i < vargs.length; i++) {
                ordered[i] = vargs[i < message.order.length ? +(message.order[i]) - 1 : i]
            }
            return util.format.apply(util, [ message.text ].concat(ordered))
        }
        // abend helper stops execution and prints a message
        options.abend = function () {
            var vargs = slice.call(arguments), key = vargs.shift(), code
            if (typeof key == 'number') {
                this._code = key
                key = vargs.shift()
            } else {
                this._code = 1
            }
            var message = this.format.apply(this, [ key ].concat(vargs))
            this._redirect = 'stderr'
            throw this._thrown = new Error(message)
        }
        // help helper prints stops execution and prints the help message
        options.help = function () {
            this._redirect = 'stdout'
            this._code = 0
            throw this._thrown = new Error(this.usage)
        }
        // exit helper stops execution and exits with the given code
        options.exit = function (code) {
            this._code = code
            throw this._thrown = new Error
        }
        // register a signal handler you can test with the event emitter.
        options.signal = function (signal, handler) {
            this.events.on(signal, handler)
            process.on(signal, handler)
        }

        // null localization means no such command found and no default action
        if (!l10n) {
            options.abend('command required')
        }

        // parse arguments
        options.given = getopt(l10n.pattern, options.params, argv, function (message) {
            options.abend(message)
        })

        // run program
        main(options, async())

    }, function (error) {

        // if we threw the error, write it to the console, otherwise rethrow
        if (error === options._thrown) {

            // write message if message
            if (error.message) {
                io[options._redirect].write(error.message)
                io[options._redirect].write('\n')
            }

            // exit with error code
            return [ block, options._code ]

        } else {

            // yoiks, and away!
            throw error
        }

    }], function () {

        // zero exit code
        return [ block, 0 ]

    })()

})
