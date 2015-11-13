var cadence = require('cadence')
var createUsage = require('./usage')
var getopt = require('./getopt')
var util = require('util')
var slice = [].slice
var interrupt = require('./interrupt')

function isNumeric (n) { return !isNaN(parseFloat(n)) && isFinite(n) }

function Program (usage, env, argv, io) {
    this._usage = usage

    // use environment `LANG` or else language of first usage definition
    this.lang = env.LANG ? env.LANG.split('.')[0] : usage.language

    this.argv = argv = argv.slice()
    this.params = {}
    this.env = env
    this.stdout = io.stdout
    this.stderr = io.stderr
    this.stdin = io.stdin
    this.events = io.events

    // see if the first argument is a sub-command
    var command = usage.getCommand(argv)
    if (!command) {
        this.command = []
        this.abend('command required')
    }
    this.command = command

    // set program object properties
    this.command = command
    this.argv = argv.slice(command.length)
    // parse arguments
    this.given = getopt(usage.getPattern(command), this.params, this.argv, function (message) {
        this.abend(message)
    }.bind(this))
    this.param = {}
    for (var key in this.params) {
        this.param[key] = this.params[key][this.params[key].length - 1]
    }
}

// format messages using strings.
Program.prototype.format = function (key) {
    return this._usage.format(this.lang, this.command, key, slice.call(arguments, 1))
}

// abend helper stops execution and prints a message
Program.prototype.abend = function () {
    var vargs = slice.call(arguments), key = vargs.shift(), code
    if (typeof key == 'number') {
        this._code = key
        key = vargs.shift()
    } else {
        this._code = 1
    }
    var message
    if (key) {
        message = this._usage.format(this.lang, this.command, key, vargs)
    }
    this._redirect = 'stderr'
    interrupt.panic(new Error, 'abend', { key: key, message: message, code: this._code })
}

// help helper prints stops execution and prints the help message
Program.prototype.help = function () {
    this._redirect = 'stdout'
    this._code = 0
    interrupt.panic(new Error, 'help', {
        message: this._usage.chooseUsage(this.lang, this.command), code: this._code })
}

Program.prototype.required = function () {
    slice.call(arguments).forEach(function (param) {
        if (!(param in this.param)) {
            this.abend(param + ' is required')
        }
    }, this)
}

Program.prototype.numeric = function () {
    this.validate.apply(this, [ '%s is not numeric' ].concat(slice.call(arguments))
                                                     .concat(isNumeric))
}

Program.prototype.validate = function () {
    var vargs = slice.call(arguments)
    var format = vargs.shift()
    var test = vargs.pop()
    var f = test instanceof RegExp ? function (value) {
        return test.test(value)
    } : test
    vargs.forEach(function (param) {
        if ((param in this.param) && !f(this.param[param])) {
            this.abend(util.format(format, param))
        }
    }, this)
}

Program.prototype.helpIf = function (help) {
    if (help) this.help()
}

// exit helper stops execution and exits with the given code
Program.prototype.exit = function (code) {
    interrupt.panic(new Error, 'exit', { code: code })
}

// register a signal handler you can test with the event emitter.
Program.prototype.signal = function (signal, handler) {
    this.events.on(signal, handler)
    process.on(signal, handler)
}

module.exports = cadence(function (async, source, env, argv, io, main) {
    // parse usage
    var usage = createUsage(source)
    if (!usage) {
        throw new Error('no usage found')
    }

    var program = new Program(createUsage(source), env, argv, io)

    // run program
    async(function () {
        main(program, async())
    }, function (code) {
        return code == null ? 0 : code
    })
})
