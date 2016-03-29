var cadence = require('cadence')
var createUsage = require('./usage')
var getopt = require('./getopt')
var util = require('util')
var slice = [].slice
var interrupt = require('interrupt').createInterrupter('bigeasy.arguable')
var events = require('events')

function isNumeric (n) { return !isNaN(parseFloat(n)) && isFinite(n) }

function Program (usage, env, argv, io) {
    this._usage = usage

    // use environment `LANG` or else language of first usage definition
    this.lang = env.LANG ? env.LANG.split('.')[0] : usage.language

    this.command_ = this._createCommand(usage, argv.slice())

    this.argv = argv = argv.slice()
    this.params = {}
    this.env = env
    this.stdout = io.stdout
    this.stderr = io.stderr
    this.stdin = io.stdin
    this.send = io.send
    this._process = io.events
    this._hooked = {}

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
    var gotopt = getopt(usage.getPattern(command), this.argv)
    if (gotopt.abend) {
        this.abend(gotopt.abend, gotopt.context)
    }
    this.params = gotopt.params
    this.given = gotopt.params
    this.param = {}
    for (var key in this.params) {
        this.param[key] = this.params[key][this.params[key].length - 1]
    }
}
util.inherits(Program, events.EventEmitter)

Program.prototype._createCommand = function (usage, argv) {
    var state, root, parent = {}, path = [], command
    root = parent
    for (;;) {
        state = usage.getCommandRedux(argv, state)
        if (!state) {
            break
        }
        argv = argv.slice(state.command.length)
        while (state.command.length != 0) {
            command = state.command.shift()
            path.push(command)
            parent.command = {
                command: command, given: [], params: {}, param: {}
            }
            parent = parent.command
        }
        var params = {}
        var opt = getopt(usage.getPattern(path), argv)
        parent.command = {
            name: command,
            given: opt.given,
            params: opt.params,
            param: {}
        }
        parent = parent.command
        for (var key in parent.params) {
            parent.param[key] = parent.params[key][parent.params[key].length - 1]
        }
    }
    return root.command
}

Program.prototype.on = function (event, listener) {
    this._hook(event)
    events.EventEmitter.prototype.on.call(this, event, listener)
}

Program.prototype.once = function (event, listener) {
    this._hook(event)
    events.EventEmitter.prototype.once.call(this, event, listener)
}

Program.prototype._hook = function (event) {
    if (!this._hooked[event]) {
        this._process.on(event, function () {
            this.emit.apply(this, [ event ].concat(slice.call(arguments)))
        }.bind(this))
        this._hooked[event] = true
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
    throw interrupt(new Error('abend'), { key: key, stderr: message, code: this._code })
}

// help helper prints stops execution and prints the help message
Program.prototype.help = function () {
    this._code = 0
    throw interrupt(new Error('help'), {
        stdout: this._usage.chooseUsage(this.lang, this.command),
        code: this._code
    })
}

Program.prototype.required = function () {
    slice.call(arguments).forEach(function (param) {
        if (!(param in this.param)) {
            this.abend(param + ' is required')
        }
    }, this)
}

Program.prototype.assert = function (condition, message) {
    if (!condition) this.abend(message)
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

// exit helper stops execution and exits with the given code, hmm...
// TODO This ought to be testable, how do I test this?
Program.prototype.exit = function (code) {
    throw interrupt(new Error('exit'), { code: code })
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
