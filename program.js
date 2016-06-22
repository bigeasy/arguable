var cadence = require('cadence')
var createUsage = require('./usage')
var getopt = require('./getopt')
var util = require('util')
var slice = [].slice
var interrupt = require('interrupt').createInterrupter('bigeasy.arguable')
var events = require('events')

function isNumeric (n) { return !isNaN(parseFloat(n)) && isFinite(n) }

// TODO IPv6.
function isListen (value) {
    var bind = value.split(':')
    if (bind.length == 1) {
        bind.unshift('0.0.0.0')
    }
    if (isNumeric(bind[1])) {
        var parts = bind[0].split('.')
        if (parts.length == 4) {
            return parts.filter(function (part) {
                return isNumeric(part) && 0 <= +part && +part <= 255
            }).length == 4
        }
    }
    return false
}

function Command (program, name, gotopts) {
    this.program = program
    this.name = name
    this.given = gotopts.given
    this.params = gotopts.params
    this.ordered = gotopts.ordered
    this.terminal = gotopts.terminal
    this.param = {}
    this.given.forEach(function (key) {
        this.param[key] = this.params[key][this.params[key].length - 1]
    }, this)
}

Command.prototype.required = function () {
    slice.call(arguments).forEach(function (param) {
        if (!(param in this.param)) {
            this.program.abend(param + ' is required')
        }
    }, this)
}

Command.prototype.numeric = function () {
    this.validate.apply(this, [ '%s is not numeric' ].concat(slice.call(arguments))
                                                     .concat(isNumeric))
}

Command.prototype.bind = function (name) {
    this.validate('%s is not bindable', name, isListen)
    var bind = this.param[name].split(':')
    if (bind.length == 1) {
        bind.unshift('0.0.0.0')
    }
    return { address: bind[0], port: +bind[1] }
}

Command.prototype.validate = function () {
    var vargs = slice.call(arguments)
    var format = vargs.shift()
    var test = vargs.pop()
    var f = test instanceof RegExp ? function (value) {
        return test.test(value)
    } : test
    vargs.forEach(function (param) {
        if ((param in this.param) && !f(this.param[param])) {
            this.program.abend(util.format(format, param))
        }
    }, this)
}

function Program (usage, env, argv, io) {
    this._usage = usage

    // use environment `LANG` or else language of first usage definition
    this.lang = env.LANG ? env.LANG.split('.')[0] : usage.language

    this.path = []

    var state, root, parent = {}, path = [], command
    root = parent
    for (;;) {
        state = usage.getCommand(argv, state)
        if (!state) {
            break
        }
        argv = argv.slice(state.command.length)
        while (state.command.length != 0) {
            command = state.command.shift()
            path.push(command)
            parent.command = new Command(this, command, { given: [], params: {} })
            parent = parent.command
        }
        var params = {}
        var opt = getopt(usage.getPattern(path), argv)
        if (opt.abend) {
            this.abend(opt.abend, opt.context)
        }
        parent.command = new Command(this, command, opt)
        parent = parent.command
    }
    this.command = root.command
    if (!this.command) {
        this.path = []
        this.abend('command required')
    }
    var path = [], iterator = this.command
    while (iterator.command) {
        path.push(iterator.command.name)
        iterator = iterator.command
    }

    this.argv = argv = argv.slice()
    this.params = {}
    this.env = env
    this.stdout = io.stdout
    this.stderr = io.stderr
    this.stdin = io.stdin
    this.params = io.params
    this.send = io.send
    this._require = io.require
    this._process = io.events
    this._hooked = {}

    this.path = path
}
util.inherits(Program, events.EventEmitter)

Program.prototype.on = function (event, listener) {
    this._hook(event)
    events.EventEmitter.prototype.on.call(this, event, listener)
}

Program.prototype.once = function (event, listener) {
    this._hook(event)
    events.EventEmitter.prototype.once.call(this, event, listener)
}

Program.prototype.disconnect = function () {
    this._process.disconnect()
}

Program.prototype.disconnectIf = function () {
    if (this.connected) {
        this.disconnect()
    }
}

Program.prototype.__defineSetter__('exitCode', function (exitCode) {
    this._process.exitCode = exitCode
})

Program.prototype.__defineGetter__('exitCode', function () {
    return this._process.exitCode
})

Program.prototype.__defineGetter__('connected', function () {
    return this._process.connected
})

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
    return this._usage.format(this.lang, this.path, key, slice.call(arguments, 1))
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
        message = this._usage.format(this.lang, this.path, key, vargs)
    }
    this._redirect = 'stderr'
    throw interrupt({
        name: 'abend',
        context: {
            key: key,
            method: 'abend',
            stderr: message,
            code: this._code
        }
    })
}

// help helper prints stops execution and prints the help message
Program.prototype.help = function () {
    this._code = 0
    throw interrupt({
        name: 'help',
        context: {
            method: 'help',
            stdout: this._usage.chooseUsage(this.lang, this.path),
            code: this._code
        }
    })
}

Program.prototype.assert = function (condition, message) {
    if (!condition) this.abend(message)
}

Program.prototype.require = function (moduleName) {
    return this._require(moduleName)
}

Program.prototype.helpIf = function (help) {
    if (help) this.help()
}

Program.prototype.delegate = cadence(function (async, prefix) {
    var argv = this.argv.slice()
    var sub = argv.shift()
    var pkg = [ prefix, sub ].join('.')
    var f

    try {
        f = require(pkg)
    } catch (error) {
        if (error.code == 'MODULE_NOT_FOUND') {
            this.abend('cannot find executable command', this.path.concat(sub).join(' '))
        } else {
            throw error
        }
    }

    var io = {
        stdout: this.stdout,
        stdin: this.stdin,
        stderr: this.stderr,
        events: this.events
    }
    f(this.env, argv, io, async())
})

// exit helper stops execution and exits with the given code, hmm...
// TODO This ought to be testable, how do I test this?
Program.prototype.exit = function (code) {
    throw interrupt({ name: 'exit', context: { code: code } })
}

module.exports = cadence(function (async, source, env, argv, io, main) {
    // parse usage
    var usage = createUsage(source)
    if (!usage) {
        throw new Error('no usage found')
    }

    // run program
    main(new Program(createUsage(source), env, argv, io), async())
})
