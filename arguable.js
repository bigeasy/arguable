var stream = require('stream')
var events = require('events')
var exit = require('./exit')

var Program = require('./program')

var slice = [].slice

// Use given stream or create pseudo-stream.
function createStream (s) { return s || new stream.PassThrough }

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

    // Check for default values for named parameters when argument parser is
    // invoked as a main module.
    var defaults = typeof vargs[0] == 'object' ? vargs.shift() : {}

    // Ensure we have defaults.
    defaults.argv || (defaults.argv = [])
    defaults.properties || (defaults.properties = [])

    // Main body of argument parser or program is final argument.
    var main = vargs.shift()

    var properties = vargs.shift() || {}

    var invoke = module.exports = function (argv, options, callback) {
        var vargs = slice.call(arguments, arguments.length >= 3 ? 2 : 1)
        var parameters = []
        if (Array.isArray(argv)) {
            argv = [ argv ]
        } else {
            var object = {}
            for (var key in argv) {
                object[key] = argv[key]
            }
            argv = [ object ]
            if (Array.isArray(object.argv)) {
                argv.push(object.argv)
                delete object.argv
            }
        }
        if (typeof options == 'function') {
            callback = options
            options = {}
        }
        argv.unshift(defaults.argv)
        argv = argv.slice()
        while (argv.length != 0) {
            var argument = argv.shift()
            switch (typeof argument) {
            case 'object':
                if (Array.isArray(argument)) {
                    argv.unshift.apply(argv, argument)
                } else {
                    if (('name' in argument) &&
                        ('value' in argument) &&
                        Object.keys(argument).length == 2
                    ) {
                        parameters.push(argument)
                    } else {
                        for (var name in argument) {
                            parameters.push({ name: name, value: argument[name] })
                        }
                    }
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

        // Note that all the other options are debugging options.
        if (options instanceof events.EventEmitter) {
            options = { events: options }
            options.stdin = options.events.stdin
            options.stdout = options.events.stdout
            options.stderr = options.events.stderr
        }
        // TODO Okay, now we have space for additional arguments that follow the
        // event emitter or the options. These can be passed in as variadic
        // arguments to be interpreted by the caller. This can be experimental.
        //
        var send = options.send || options.events && options.events.send && function () {
            options.events.send.apply(options.events, slice.call(arguments))
        }
        var ee = options.events
        if (ee == null) {
            ee = new events.EventEmitter
            ee.mainModule = process.mainModule
            ee.connected = ('connected' in options) ? options.connected : true
            ee.disconnect = function () { this.connected = false }
        }
        var isMainModule = ('isMainModule' in options)
                         ? options.isMainModule
                         : process.mainModule === module
        var program = new Program(usage, parameters, {
            module: module,
            stdout: createStream(options.stdout),
            stdin: createStream(options.stdin),
            stderr: createStream(options.stderr),
            isMainModule: isMainModule,
            events: ee,
            properties: [ defaults.properties, properties, options.properties || {} ],
            send: send || null,
            env: options.env || {}
        })
        // TODO This delay is to allow users to do something with the pass
        // through streams and event emitter.
        process.nextTick(main.bind.apply(main, [ null, program ].concat(vargs)))
        return program
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
