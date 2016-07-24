var cadence = require('cadence')
var createUsage = require('./usage')
var assert = require('assert')
var getopt = require('./getopt')
var util = require('util')
var slice = [].slice
var interrupt = require('interrupt').createInterrupter('bigeasy.arguable')
var events = require('events')
var Command = require('./command')

function newListener (eventName) {
    switch (eventName) {
    case 'shutdown':
        if (this._shutdown.count == 0) {
            this._process.on('SIGINT', this._shutdown.listener)
            this._process.on('SIGTERM', this._shutdown.listener)
        }
        this._shutdown.count++
        break
    default:
        this._getListenerProxy(eventName).count++
        break
    }
}

function removeListener (eventName) {
    switch (eventName) {
    case 'shutdown':
        this._shutdown.count--
        if (this._shutdown.count == 0) {
            this._process.removeListener('SIGINT', this._shutdown.listener)
            this._process.removeListener('SIGTERM', this._shutdown.listener)
        }
        break
    default:
        var proxy = this._getListenerProxy(eventName)
        proxy.count--
        if (proxy.count == 0) {
            this._process.removeListener(eventName, proxy.listener)
            delete this._proxies[eventName]
        }
        break
    }
}

// This will never be pretty. Let it be ugly. Let it swallow all the sins before
// they enter your program, so that your program can be a garden of pure
// ideology.
function Program (usage, env, argv, io, module) {
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
    this._hooked = {} // TODO outgoing.
    this._module = module

    this.path = path

    events.EventEmitter.call(this)

    this._proxies = {}
    this._shutdown = {
        count: 0,
        listener: function () { this.emit('shutdown') }.bind(this)
    }

    this.on('removeListener', removeListener.bind(this))
    this.on('newListener', newListener.bind(this))
}
util.inherits(Program, events.EventEmitter)

Program.prototype._getListenerProxy = function (eventName) {
    var proxy = this._proxies[eventName]
    if (proxy == null) {
        var listener = function () {
            this.emit.apply(this, [ eventName ].concat(slice.call(arguments)))
        }.bind(this)
        this._process.addListener(eventName, listener)
        proxy = this._proxies[eventName] = { listener: listener, count: 0 }
    }
    return proxy
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
            method: 'abend',
            key: key,
            vargs: vargs,
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

Program.prototype.delegate = cadence(function (async, format) {
    if (this.argv.length == 0) {
        this.abend('sub command missing')
    }
    var argv = this.argv.slice()
    var command = argv.shift()
    var pkg
    if (typeof format == 'function') {
        pkg = format(command, this)
    } else if (typeof format == 'string') {
        pkg = util.format(format, command)
    }
    var arguable
    try {
        arguable = this._module.require(pkg)
    } catch (error) {
        if (error.code == 'MODULE_NOT_FOUND') {
            this.abend('sub command not found', command, pkg)
        } else {
            throw error
        }
    }
    arguable(argv, {
        stdout: this.stdout,
        env: this.env,
        stdin: this.stdin,
        stderr: this.stderr,
// TODO Should be this, not _process, maybe rename `_parent`.
        events: this._process,
        send: this.send
    }, async())
})

// exit helper stops execution and exits with the given code, hmm...
// TODO This ought to be testable, how do I test this?
Program.prototype.exit = function (code) {
    throw interrupt({ name: 'exit', context: { code: code } })
}

module.exports = cadence(function (async, source, env, argv, io, main, module) {
    assert(arguments.length == 7)
    // parse usage
    var usage = createUsage(source)
    if (!usage) {
        throw new Error('no usage found')
    }

    // run program
    main(new Program(createUsage(source), env, argv, io, module), async())
})
