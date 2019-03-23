var stream = require('stream')
var events = require('events')
var exit = require('./exit')

var Destructible = require('destructible')

var coalesce = require('extant')

var Program = require('./arguable')

var slice = [].slice

var rescue = require('rescue')

var Signal = require('signal')

function Child (destructible, exit, options) {
    this._destructible = destructible
    this._exit = exit
    this.options = options
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

    // Optional options that both configure Arguable and provide our dear user
    // with a means to specify production objects for production and mock
    // objects for testing.
    var definition = typeof vargs[0] == 'object' ? vargs.shift() : {}

    // The main method.
    var main = vargs.shift()

    // TODO How about an optinal method here for command line completion logic?
    module.exports = function (argv, invocation, callback) {
        var vargs = []
        vargs.push.apply(vargs, arguments)

        var argv = vargs.shift()

        var options = {}
        for (var option in definition) {
            options[option] = definition[option]
        }
        for (var option in invocation) {
            options[option] = invocation[option]
        }

        var parameters = []
        if (!Array.isArray(argv)) {
            argv = [ argv ]
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

        var lang = coalesce(options.$lang, process.env.LANG && process.env.LANG.split('.')[0])
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
            stdin: coalesce(options.$stdin, process.stdin),
            stdout: coalesce(options.$stdout, process.stdout),
            stderr: coalesce(options.$stderr, process.stderr),
            isMainModule: isMainModule,
            options: options,
            lang: lang
        })

        var cb = vargs.pop()

        var isMainModule = ('$isMainModule' in options)
                         ? options.$isMainModule
                         : process.mainModule === module
        program.isMainModule = isMainModule
        program.stdout = coalesce(options.$stdout, process.stdout)
        program.stderr = coalesce(options.$stderr, process.stderr)
        program.stdin = coalesce(options.$stdin, process.stdin)
        var identifier = typeof options.$destructible == 'boolean'
                       ? module.filename : options.$destructible
        program.identifier = identifier
        var destructible = new Destructible(identifier)
        var trap = { SIGINT: 'destroy', SIGTERM: 'destroy', SIGHUP: 'swallow' }
        var $trap = ('$trap' in options) ? options.$trap : {}
        var $untrap = ('$untrap' in options)
                    ? options.$untrap
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
        var child = new Child(destructible, exit, options)
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
                main(destructible, program, async())
            }, function (error) {
                initialize(error)
                throw error
            }], [], function (vargs) {
                initialize()
                return vargs.concat(child)
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
        module.exports(process.argv.slice(2), {}, exit(process))
    }
}
