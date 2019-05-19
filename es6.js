const Latch = require('signal/latch')
const stream = require('stream')
const coalesce = require('extant')
const Arguable = require('./arguable')
const rescue = require('rescue')
const Usage = require('./usage')
const _main = require('./main')
const rethrow = require('./rethrow')

class Child {
    constructor (promise, destroyed, options) {
        this.promise = promise
        this._destroyed = destroyed
        this.options = options
    }

    destroy () {
        this._destroyed.call()
    }
}

async function _execute (main, arguable) {
    try {
        const promise = main(arguable)
        if (promise instanceof Promise) {
            return await promise
        }
        return promise
    } catch (error) {
        rescue([{
            name: 'message',
            when: [ '..', /^bigeasy\.arguable#abend$/m, 'only' ]
        }])(function (rescued) {
            throw rescued.errors[0]
        })(error)
    }
}

module.exports = function (...vargs) {
    // First argument is always the module.
    var module = vargs.shift()

    // Usage source can be specified explicitly, or else it is sought in the
    // comments of the main module.
    var source = typeof vargs[0] == 'string' ? vargs.shift() : module.filename

    var usage = Usage(source)

    // Optional options that both configure Arguable and provide our dear user
    // with a means to specify production objects for production and mock
    // objects for testing.
    var definition = typeof vargs[0] == 'object' ? vargs.shift() : {}

    // The main method.
    var main = vargs.shift()

    // TODO How about an optinal method here for command line completion logic?
    module.exports = function (argv, invocation) {
        var options = {}
        for (var option in definition) {
            options[option] = definition[option]
        }
        for (var option in coalesce(invocation, {})) {
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
                // TODO Probably want `Arguable.flatten({ name: 'a', value: 1 // }, ...)`.
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

        var callback = vargs.pop()

        var pipes = {}
        if (options.$pipes != null) {
            options.$pipes = {}
            for (var fd in coalesce(definition.$pipes, {})) {
                options.$pipes[fd] = definition.$pipes[fd]
            }
            for (var fd in coalesce(invocation.$pipes, {})) {
                options.$pipes[fd] = invocation.$pipes[fd]
            }
            for (var fd in coalesce(options.$pipes)) {
                if (options.$pipes[fd] instanceof require('stream').Stream) {
                    pipes[fd] = options.$pipes[fd]
                } else {
                    var socket = { fd: +fd }
                    for (var property in options.$pipes[fd]) {
                        socket[property] = options.$pipes[fd][property]
                    }
                    pipes[fd] = new require('net').Socket(socket)
                }
            }
        }

        var isMainModule = ('$isMainModule' in options)
                         ? options.$isMainModule
                         : process.mainModule === module
        var lang = coalesce(options.$lang, process.env.LANG && process.env.LANG.split('.')[0])

        var destructible, identifier
        var identifier = ('$destructible' in options)
                       ? typeof options.$destructible == 'boolean'
                            ? module.filename : options.$destructible
                       : module.filename

        var arguable = new Arguable(usage, parameters, {
            identifier: identifier,
            isMainModule: isMainModule,
            stdin: coalesce(options.$stdin, process.stdin),
            stdout: coalesce(options.$stdout, process.stdout),
            stderr: coalesce(options.$stderr, process.stderr),
            options: options,
            pipes: pipes,
            lang: lang
        })
        let _destroyed = null
        arguable.destroyed = new Promise(resolve => _destroyed = resolve)

        var scram = coalesce(options.$scram, 10000)
        switch (typeof scram) {
        case 'object':
            var parameter = Object.keys(scram)[0]
            scram = {
                name: parameter,
                value: +coalesce(arguable.ultimate[parameter], scram[parameter])
            }
            break
        case 'string':
            scram = {
                name: options.$scram,
                value: +coalesce(arguable.ultimate[options.$scram], scram)
            }
            break
        case 'number':
            scram = { name: null, value: scram }
            break
        }

        arguable.scram = scram.value

        var trap = { SIGINT: 'destroy', SIGTERM: 'destroy', SIGHUP: 'swallow' }
        var $trap = ('$trap' in options) ? options.$trap : {}
        var $untrap = ('$untrap' in options)
                    ? options.$untrap
                    : isMainModule ? false
                                   : true
        var signals = coalesce(options.$signals, process)
        switch (typeof $trap) {
        case 'boolean':
            if (!$trap) {
                trap = {}
            }
            break
        case 'string':
            for (var signal in trap) {
                trap[signal] = $trap
            }
            break
        default:
            for (var signal in $trap) {
                trap[signal] = $trap[signal]
            }
            break
        }
        var traps = [], listener
        for (var signal in trap) {
            switch (trap[signal]) {
            case 'destroy':
                traps.push({
                    signal: signal,
                    listener: listener = () => _destroyed.call()
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
        return new Child(_execute(main, arguable), _destroyed, arguable.options)
    }

    if (module === process.mainModule) {
        _main(process)(module.exports, process.argv.slice(2), rethrow)
    }
}
