var stream = require('stream'),
    events = require('events'),
    Program = require('./program'),
    exit = require('./exit'),
    slice = [].slice

function createStream (s) {
    return s || new stream.PassThrough
}

module.exports = function () {
    var vargs = slice.call(arguments)
    var module = vargs.shift()
    var params = {}
    var main = vargs.pop()
    if (typeof main == 'object') {
        params = main
        main = vargs.pop()
    }
    var source = module.filename
    if (typeof vargs[0] == 'string') {
        source = vargs.shift()
    }
    var invoke = module.exports = function (argv, options, callback) {
        var expanded = []
        if (typeof argv == 'object') {
            for (var name in argv) {
                expanded.push('--name', String(argv[name]))
            }
        } else {
            argv.forEach(function (argument) {
                switch (typeof argument) {
                case 'object':
                    if (('name' in argument) &&
                        ('value' in argument) &&
                        Object.keys(argument).length == 2
                    ) {
                        extended.push('--' + argument.name, String(argument.value))
                    } else {
                        for (var name in argument) {
                            extended.push('--' + name, String(argument[name]))
                        }
                    }
                    break
                default:
                    expanded.push(String(argument))
                    break
                }
            })
        }
        var send = options.send || options.events && options.events.send && function () {
            options.events.send.apply(options.events, slice.call(arguments))
        }
        for (var param in options.params) {
            params[param] = options.params[param]
        }
        var io = {
            stdout: createStream(options.stdout),
            stdin: createStream(options.stdin),
            stderr: createStream(options.stderr),
            events: options.events || new events.EventEmitter,
            send: send || null,
            env: options.env || {},
            params: params
        }
        var program = new Program(source, argv, io)
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
