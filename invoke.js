var cadence = require('cadence')
var createUsage = require('./usage')
var getopt = require('./getopt')
var util = require('util')
var slice = [].slice
var interrupt = require('./interrupt')

module.exports = cadence(function (async, source, env, argv, io, main) {
    var options = {}

    // parse usage
    var usage = createUsage(source)
    if (!usage) {
        throw new Error('no usage found')
    }

    // use environment `LANG` or else language of first usage definition
    var lang = env.LANG ? env.LANG.split('.')[0] : usage.language

    options.argv = argv = argv.slice()
    options.params = {}
    options.stdout = io.stdout
    options.stderr = io.stderr
    options.stdin = io.stdin
    options.events = io.events

    // format messages using strings.
    options.format = function (key) {
        return usage.format(lang, command, key, slice.call(arguments, 1))
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
        var message
        if (key) {
            message = usage.format(lang, command, key, vargs)
        }
        this._redirect = 'stderr'
        interrupt.panic(new Error, 'abend', { key: key, message: message, code: this._code })
    }
    // help helper prints stops execution and prints the help message
    options.help = function () {
        this._redirect = 'stdout'
        this._code = 0
        interrupt.panic(new Error, 'help', {
            message: usage.chooseUsage(lang, command), code: this._code })
    }
    // exit helper stops execution and exits with the given code
    options.exit = function (code) {
        interrupt.panic(new Error, 'exit', { code: code })
    }
    // register a signal handler you can test with the event emitter.
    options.signal = function (signal, handler) {
        this.events.on(signal, handler)
        process.on(signal, handler)
    }

    // see if the first argument is a sub-command
    var command = usage.getCommand(argv)
    if (!command) {
        command = []
        options.abend('command required')
    }
    options.command = command

    // set options object properties
    options.command = command

    // parse arguments
    options.given = getopt(usage.getPattern(command), options.params, argv.slice(command.length), function (message) {
        options.abend(message)
    })
    options.param = {}
    for (var key in options.params) {
        options.param[key] = options.params[key][options.params[key].length - 1]
    }

    // run program
    async(function () {
        main(options, async())
    }, function () {
        return 0
    })
})
