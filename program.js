var cadence = require('cadence')
var createUsage = require('./usage')
var assert = require('assert')
var getopt = require('./getopt')
var util = require('util')
var slice = [].slice
var interrupt = require('interrupt').createInterrupter('bigeasy.arguable')
var events = require('events')

// The program is an event emitter that proxies events from the Node.js
// `Process` object with a single special event of its own.


// The `newListner` function is used to hook the `"newListener"` event of the
// `Program` object. It will set a proxy event on the parent Node.js `Process`
// or Arguable `Program`.

//
function newListener (eventName) {
    switch (eventName) {
    // The `"shutdown"` event is a convenience event that responds to both
    // `SIGINT` and `SIGTERM`.
    case 'shutdown':
        if (this._shutdown.count == 0) {
            this._process.on('SIGINT', this._shutdown.listener)
            this._process.on('SIGTERM', this._shutdown.listener)
        }
        this._shutdown.count++
        break
    // Default is to proxy the event on the parent `Process` or `Program`.
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

//
function Program (usage, env, argv, io, module) {
    this._usage = usage

    // TODO Implement include in the language.
    // ___ include ___ required/path ___
    // TODO Implement adding to string tables, so you can add in include.

    //

    // Use environment `LANG` or else language of first usage definition.
    this.lang = env.LANG ? env.LANG.split('.')[0] : usage.language

    this.path = []

    var patterns = usage.getPattern()
    this.arguable = patterns.filter(function (pattern) {
        return pattern.arguable
    }).map(function (pattern) {
        return pattern.name
    })
    var gotopts = getopt(patterns, argv)
    if (gotopts.abend) {
        this.abend(gotopts.abend, gotopts.context)
    }

    this.given = gotopts.given
    this.params = gotopts.params
    this.ordered = gotopts.ordered
    this.terminal = gotopts.terminal

    this.param = {}
    this.given.forEach(function (key) {
        this.param[key] = this.params[key][this.params[key].length - 1]
    }, this)

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

Program.prototype._setParameters = function (ordered) {
    this.given = ordered.map(function (parameter) {
        return parameter.name
    }).filter(function (value, index, arrayj) {
        return arrayj.indexOf(value) == index
    })
    this.params = {}
    this.arguable.forEach(function (name) {
        this.params[name] = []
    }, this)
    this.ordered.forEach(function (parameter) {
        var array = this.params[parameter.name]
        if (array == null) {
            array = this.params[parameter.name] = []
        }
        array.push(parameter.value)
    }, this)
    this.param = {}
    this.given.forEach(function (key) {
        this.param[key] = this.params[key][this.params[key].length - 1]
    }, this)
}

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

Program.prototype.required = function () {
    slice.call(arguments).forEach(function (param) {
        if (!(param in this.param)) {
            this.abend(param + ' is required')
        }
    }, this)
}

Program.prototype.validate = function () {
    var vargs = slice.call(arguments)
    var validator = null
    var type = typeof vargs[0]
    if (type == 'string' && ~vargs[0].indexOf('%s')) {
        var format = vargs.shift()
        var test = vargs.pop()
        var valid = test instanceof RegExp ? function (value) {
            return test.test(value)
        } : test
        validator = function (value) {
            if (!valid(value)) {
                throw format
            }
        }
    } else if (type == 'function') {
        validator = vargs.shift()
    } else {
        validator = vargs.pop()
    }
    var ordered = this.ordered.map(function (parameter) {
        try {
            var value = validator(parameter.value, parameter.name, this)
            if (value !== (void(0))) {
                parameter.value = value
            }
            return parameter
        } catch (error) {
            if (!(typeof error == 'string' && ~error.indexOf('%s'))) {
                throw error
            }
            this.abend(util.format(error, parameter.name), parameter.value, parameter.name)
        }
    }.bind(this))
    this._setParameters(ordered)
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
    return this._usage.format(this.lang, key, slice.call(arguments, 1))
}

// abend helper stops execution and prints a message
Program.prototype.abend = function () {
    var vargs = slice.call(arguments), key = vargs.shift(), code
    if (typeof key == 'number') {
        this._exitCode = key
        key = vargs.shift()
    } else {
        this._exitCode = 1
    }
    var message
    if (key) {
        message = this._usage.format(this.lang, key, vargs)
    }
    this._redirect = 'stderr'
    throw interrupt({
        name: 'abend',
        context: {
            method: 'abend',
            key: key,
            vargs: vargs,
            stderr: message,
            exitCode: this._exitCode
        }
    })
}

// help helper prints stops execution and prints the help message
Program.prototype.help = function () {
    this._exitCode = 0
    throw interrupt({
        name: 'help',
        context: {
            method: 'help',
            stdout: this._usage.chooseUsage(this.lang),
            exitCode: this._exitCode
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
    } else {
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

// Exit raises an exception to mimic `process.exit` behavior. Of course, this
// can be defeated by an old catch block. Here's hoping the user rethrows.
Program.prototype.exit = function (exitCode) {
    throw interrupt({ name: 'exit', context: { exitCode: exitCode } })
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
