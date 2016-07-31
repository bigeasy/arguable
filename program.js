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
function Program (source, argv, options) {
    this._usage = createUsage(source)

    //
    this.env = options.env

    // Use environment `LANG` or else language of first usage definition.
    this.lang = this.env.LANG ? this.env.LANG.split('.')[0] : this._usage.language

    this.path = []

    // Extract argument patterns from usage.
    var patterns = this._usage.getPattern()
    this.arguable = patterns.filter(function (pattern) {
        return pattern.arguable
    }).map(function (pattern) {
        return pattern.verbose
    })

    // Parse arguments and save the remaining arguments.
    try {
        var gotopts = getopt(patterns, argv)
    } catch (error) {
        this.abend(error.abend, error.context)
    }

    if (this.terminal = argv[0] == '--')  {
        argv.shift()
    }

    this._setParameters(gotopts)

    this.argv = argv

    // Assign I/O provide in `options`.
    this.stdout = options.stdout
    this.stderr = options.stderr
    this.stdin = options.stdin
    this.send = options.send

    // Capture environment.
    this.env = options.env
    this._process = options.events
    this._module = options.module

    // Become an `EventEmitter` and proxy parent events.
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

// Use an array of key/value pairs to populate some useful shortcut properties
// for working with parameters.
//
// Note to self; we use `parameters` here and in documentation because
// `arguments` is a JavaScript reserved word.

//
Program.prototype._setParameters = function (parameters) {
    // **TODO** Oof. Do I want to rename this? `parameters`, `arrayed`, `indexed`.
    this.parameters = parameters
    this.given = parameters.map(function (parameter) {
        return parameter.name
    }).filter(function (value, index, arrayj) {
        return arrayj.indexOf(value) == index
    })
    this.grouped = {}
    this.arguable.forEach(function (name) {
        this.grouped[name] = []
    }, this)
    this.parameters.forEach(function (parameter) {
        var group = this.grouped[parameter.name]
        if (group == null) {
            group = this.grouped[parameter.name] = []
        }
        group.push(parameter.value)
    }, this)
    this.ultimate = {}
    this.given.forEach(function (key) {
        this.ultimate[key] = this.grouped[key][this.grouped[key].length - 1]
    }, this)
}

// Register a listener proxy with the parent process or Arguable program.
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

// Assert that there is a value present for a required argument.
Program.prototype.required = function () {
    slice.call(arguments).forEach(function (name) {
        if (!(name in this.ultimate)) {
            this.abend(name + ' is required')
        }
    }, this)
}

// Variadic nonsense to support handful of different ways to invoke this
// validation function. The validation can change the type and value of the
// parameters in the in the parameters array, so valiation is also
// transmogrifcation of strings into appropriately typed and structured
// parameters for your program.
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
// TODO What? Why am I throwing this?
                throw format
            }
        }
    } else if (type == 'function') {
        validator = vargs.shift()
    } else {
        validator = vargs.pop()
    }
    var parameters = this.parameters.map(function (parameter) {
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
    this._setParameters(parameters)
}

// Proxy to parent's disconnect.
Program.prototype.disconnect = function () {
    this._process.disconnect()
}

// Disconnect if not already disconnected. Disconnecting is the only way to
// terminate an additional parent/child socket, so I'll write this up to a
// shutdown handler that might be called twice.
Program.prototype.disconnectIf = function () {
    if (this.connected) {
        this.disconnect()
    }
}

// Process properties that are proxied to the parent.

//
Program.prototype.__defineSetter__('exitCode', function (exitCode) {
    this._process.exitCode = exitCode
})

Program.prototype.__defineGetter__('exitCode', function () {
    return this._process.exitCode
})

Program.prototype.__defineGetter__('connected', function () {
    return this._process.connected
})

// Format a message using the string tables provided in the usage message.
Program.prototype.format = function (key) {
    return this._usage.format(this.lang, key, slice.call(arguments, 1))
}

// abend helper stops execution and prints a message
Program.prototype.abend = function () {
    var vargs = slice.call(arguments), key = vargs.shift(), code
    if (typeof key == 'number') {
    // **TODO** `_exitCode` looks unused.
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

// Stop execution and print help message.
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

// Saves having to write a unit test for every application that checks a branch
// that does exactly this.
Program.prototype.helpIf = function (help) {
    if (help) this.help()
}

// Load an arguable module and invoke it using this `Program` as the parent. Not
// at all certain that I want to have all this formatting nonsense. Can't the
// parent simply invoke it with a string?
//
// **TODO** Let's hedge and accept a package name. If that is easy enough to use
// in the programs that currently use Aguable, we can come back and remove this.
Program.prototype.delegate = cadence(function (async, format, argv) {
    if (argv == null) {
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
    } else {
        pkg = format
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

module.exports = Program
