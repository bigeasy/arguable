const coalesce = require('extant')
const rescue = require('rescue')

const Arguable = require('./arguable')
const Usage = require('./usage')
const _main = require('./main')
const rethrow = require('./rethrow')

class Child {
    constructor (promise, destroyed, options) {
        this.promise = promise
        this._destroyed = destroyed
        this.options = options
    }

    destroy (...vargs) {
        this._destroyed.apply(null, vargs)
    }
}

async function _execute (main, arguable, signals, untrap) {
    try {
        return await main(arguable)
    } catch (error) {
        rescue(error, [ Arguable.Error ], error => { throw error })
    } finally {
        for (const trap of untrap) {
            signals.removeListener(trap.signal, trap.listener)
        }
    }
}

module.exports = function (...vargs) {
    // First argument is always the module.
    const module = vargs.shift()

    // Usage source can be specified explicitly, or else it is sought in the
    // comments of the main module.
    const source = typeof vargs[0] == 'string' ? vargs.shift() : module.filename

    const usage = Usage(source)

    // Optional options that both configure Arguable and provide our dear user
    // with a means to specify production objects for production and mock
    // objects for testing.
    const definition = typeof vargs[0] == 'object' ? vargs.shift() : {}

    // The main method.
    const main = vargs.shift()

    // TODO How about an optinal method here for command line completion logic?
    module.exports = function (argv, invocation = {}) {
        const options = Object.assign({}, definition, coalesce(invocation, {}))

        const parameters = []
        if (!Array.isArray(argv)) {
            argv = [ argv ]
        }

        argv = argv.slice()
        while (argv.length != 0) {
            const argument = argv.shift()
            switch (typeof argument) {
            case 'object':
                // TODO Probably want `Arguable.flatten({ name: 'a', value: 1 // }, ...)`.
                // TODO Flattening would require knowing from the parameters
                // whether or not they accepted arguments in the case of
                // switch arguments.
                if (Array.isArray(argument)) {
                    argv.unshift.apply(argv, argument)
                } else {
                    const unshift = []
                    for (const name in argument) {
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

        const pipes = {}
        if (options.$pipes != null) {
            options.$pipes = Object.assign({}, coalesce(definition.$pipes, {}), coalesce(invocation.$pipes, {}))
            for (const fd in options.$pipes) {
                if (options.$pipes[fd] instanceof require('stream').Stream) {
                    pipes[fd] = options.$pipes[fd]
                } else {
                    const socket = { fd: +fd }
                    for (const property in options.$pipes[fd]) {
                        socket[property] = options.$pipes[fd][property]
                    }
                    pipes[fd] = new require('net').Socket(socket)
                }
            }
        }

        const isMainModule = ('$isMainModule' in options)
                         ? options.$isMainModule
                         : process.mainModule === module
        const lang = coalesce(options.$lang, process.env.LANG && process.env.LANG.split('.')[0])

        const arguable = new Arguable(usage, parameters, {
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

        const trap = { SIGINT: 'destroy', SIGTERM: 'destroy', SIGHUP: 'swallow' }
        const $trap = ('$trap' in options) ? options.$trap : {}
        const $untrap = ('$untrap' in options)
                      ? options.$untrap
                      : isMainModule ? false
                                     : true
        const signals = coalesce(options.$signals, process)
        switch (typeof $trap) {
        case 'boolean':
            if (!$trap) {
                for (const name in trap) {
                    delete trap[name]
                }
            }
            break
        case 'string':
            for (const signal in trap) {
                trap[signal] = $trap
            }
            break
        default:
            for (const signal in $trap) {
                trap[signal] = $trap[signal]
            }
            break
        }
        const traps = []
        for (const signal in trap) {
            switch (trap[signal]) {
            case 'destroy': {
                const listener = () => {
                    _destroyed(signal)
                }
                traps.push({ signal, listener })
                signals.on(signal, listener)
                break
            }
            case 'swallow': {
                const listener = () => {}
                traps.push({ signal, listener })
                signals.on(signal, listener)
                break
            }
            case 'default':
                break
            }
        }
        return new Child(_execute(main, arguable, signals, $untrap ? traps : []), _destroyed, arguable.options)
    }

    if (module === process.mainModule) {
        _main(process)(module.exports, process.argv.slice(2), rethrow)
    }
}
