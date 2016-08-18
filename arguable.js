var stream = require('stream')
var events = require('events')
var exit = require('./exit')

var Program = require('./program')

var slice = [].slice

// Use given stream or create pseudo-stream.
function createStream (s) { return s || new stream.PassThrough }

module.exports = function () {
    var vargs = slice.call(arguments)
    var module = vargs.shift()
    // Usage source can be specified explicitly, or else it is sought in the
    // comments of the main module.
    var usage = module.filename
    if (typeof vargs[0] == 'string') {
        usage = vargs.shift()
    }
    // Check for default values for named parameters when argument parser is
    // invoked as a main module.
    var defaultParameters = {}
    if (typeof vargs[0] == 'object') {
        defaultParameters = vargs.shift()
    }
    var main = vargs.shift()
    var invoke = module.exports = function (argv, options, callback) {
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
        argv.unshift(defaultParameters)
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
            send: send || null,
            env: options.env || {}
        })
        main(program, callback)
        return program
    }
    if (module === process.mainModule) {
        invoke(process.argv.slice(2), {
// No. Stop! There is no `process.stdio`. Do not addd one. (Again.)
            env: process.env,
            stdout: process.stdout,
            stdin: process.stdin,
            stderr: process.stderr,
            events: process
        }, exit(process))
    }
}
