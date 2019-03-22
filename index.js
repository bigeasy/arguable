var stream = require('stream')
var events = require('events')
var exit = require('./exit')

var Destructible = require('destructible')

var coalesce = require('extant')

var Program = require('./arguable')

var slice = [].slice

var rescue = require('rescue')

var Signal = require('signal')

// Use given stream or create pseudo-stream.
function createStream (s) { return s || new stream.PassThrough }

function Child (destructible, exit) {
    this._destructible = destructible
    this._exit = exit
}

Child.prototype.destroy = function () {
    this._destructible.destroy()
}

Child.prototype.exit = function (callback) {
    this._exit.wait(callback)
}

module.exports = function () {
    // Variadic arguments.
    var vargs = slice.call(arguments)

    // First argument is always the module.
    var module = vargs.shift()

    // Usage source can be specified explicitly, or else it is sought in the
    // comments of the main module.
    var usage = typeof vargs[0] == 'string'
              ? vargs.shift()
              : module.filename

    var attributes = typeof vargs[0] == 'object' ? vargs.shift() : {}

    var main = vargs.shift()

    var invoke = module.exports = function (argv, options, callback) {
        var vargs = slice.call(arguments, arguments.length >= 3 ? 2 : 1)
        var parameters = []
        if (!Array.isArray(argv)) {
            argv = [ argv ]
        }
        if (typeof options == 'function') {
            callback = options
            options = {}
        }
        argv = argv.slice()
        while (argv.length != 0) {
            var argument = argv.shift()
            switch (typeof argument) {
            case 'object':
                // TODO Probably want `Program.flatten({ name: 'a', value: 1 // }, ...)`.
                // TODO Flattening would require knowing from the parameters
                // whether or not they accepted arguments in the case of
                // switch arguments.
                if (Array.isArray(argument)) {
                    argv.unshift.apply(argv, argument)
                } else {
                    var unshift = []
                    for (var name in argument) {
                        unshift.push('--' + name, argument[name].toString())
                    }
                    argv.unshift(unshift)
                }
                break
            default:
                parameters.push(argument)
                break
            }
        }
        // What we're shooting for here is this:
        //
        //   Create a signature that would be a reasonable signature for a
        //   generic function that is not an Arguable argument parser.
        //
        //   Or put another way, tell the user to create an argument parser that
        //   accepts an arguments array and a pseudo-process, the program, and a
        //   callback, so that you can tell them to either use Arguable, or else
        //   implement an argument parser that accepts reasonable arguments as
        //   opposed to accepting convoluted named parameters.
        //
        // If options is really an `EventEmitter`, then our argument parser is
        // being called as a universal submodule. This is an interface that
        // allows a library module author to document that a submodule accepts
        // an arguments array and a signal handler. The library module author
        // can document as many `Program` features as they would like, or they
        // could simply say that it is only for events, or they can say that it
        // is mean to be ignored by the submodule author.
        //
        // Now the submodule author can use Arguable for their argument parser
        // and program will be correctly configured, or they can create a
        // function that takes the argument array and use the argument parser
        // module of their choice. Additional properties are arguments to the
        // argument parser, not properties on this mystery event emitter.
        var program = new Program(usage, parameters, {
            module: module,
            stdout: createStream(options.stdout),
            stdin: createStream(options.stdin),
            stderr: createStream(options.stderr),
            ready: options.ready,
            isMainModule: isMainModule,
            attributes: [ attributes, options.attributes || {} ],
            env: options.env || {}
        })

        var cb = vargs.pop()

        var isMainModule = ('$isMainModule' in options)
                         ? options.$isMainModule
                         : process.mainModule === module
        program.isMainModule = isMainModule
        // New option merging.
        var combined = {}
        for (var attribute in attributes) {
            combined[attribute] = attributes[attribute]
        }
        for (var attribute in options) {
            combined[attribute] = options[attribute]
        }
        program.stdout = coalesce(options.$stdout, process.stdout)
        program.stderr = coalesce(options.$stderr, process.stderr)
        program.stdin = coalesce(options.$stdin, process.stdin)
        attributes = combined
        var identifier = typeof attributes.$destructible == 'boolean'
                       ? module.filename : attributes.$destructible
        program.identifier = identifier
        var destructible = new Destructible(identifier)
        var trap = { SIGINT: 'destroy', SIGTERM: 'destroy', SIGHUP: 'swallow' }
        var $trap = ('$trap' in attributes) ? attributes.$trap : {}
        var $untrap = ('$untrap' in attributes)
                    ? attributes.$untrap
                    : isMainModule ? false
                                   : true
        var signals = coalesce(options.$signals, process)
        if (typeof $trap == 'boolean') {
            if (!$trap) {
                trap = {}
            }
        } else {
            for (var signal in $trap) {
                trap[signal] = $trap[signal]
            }
        }
        var traps = [], listener
        for (var signal in trap) {
            switch (trap[signal]) {
            case 'destroy':
                traps.push({
                    signal: signal,
                    listener: listener = destructible.destroy.bind(destructible)
                })
                signals.on(signal, listener)
                break
            case 'swallow':
                traps.push({
                    signal: signal,
                    listener: listener = function () {}
                })
                signals.on(signal, listener)
                break
            case 'default':
                break
            }
        }
        var exit = new Signal
        var child = new Child(destructible, exit)
        destructible.completed.wait(function () {
            var vargs = []
            vargs.push.apply(vargs, arguments)
            if ($untrap) {
                traps.forEach(function (trap) {
                    signals.removeListener(trap.signal, trap.listener)
                })
            }
            if (vargs[0]) {
                try {
                    rescue([{
                        name: 'message',
                        when: [ '..', /^bigeasy\.arguable#abend$/m, 'only' ]
                    }])(function (rescued) {
                        exit.unlatch({
                            exitCode: rescued.errors[0].exitCode
                        })
                    })(vargs[0])
                } catch (error) {
                    exit.unlatch(vargs[0])
                }
            } else {
                exit.unlatch.apply(exit, [ null ].concat(0, vargs.slice(1)))
            }
        })
        var cadence = require('cadence')
        var initialize = destructible.ephemeral('initialize')
        destructible.durable('main', cadence(function (async, destructible) {
            async([function () {
                main(destructible, program, attributes, async())
            }, function (error) {
                initialize(error)
                throw error
            }], [], function (vargs) {
                initialize()
                return vargs.concat(child, options)
            })
        }), function () {
            if (arguments[0] == null) {
                cb.apply(null, arguments)
            } else {
                destructible.destroy()
                exit.wait(cb)
            }
        })
    }
    if (module === process.mainModule) {
        invoke(process.argv.slice(2), {
// No. Stop! There is no `process.stdio`. Do not add one! (Again.)
            env: process.env,
            stdout: process.stdout,
            stdin: process.stdin,
            stderr: process.stderr,
            events: process
        }, exit(process))
    }
}
