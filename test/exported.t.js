require('proof')(25, async (okay) => {
    {
        const test = []
        const errored = require('./fixtures/errored')
        const child = errored([])
        try {
            await child.exit
        } catch (error) {
            test.push(error.message)
        }
        okay(test, [ 'panic' ], 'progagate error')
    }
    {
        const stream = require('stream')
        const echo = require('./fixtures/echo')
        const child = echo([ 'a', 'b' ], { $stdout: new stream.PassThrough })
        okay({
            exitCode: await child.exit,
            stdout: child.options.$stdout.read().toString()
        }, {
            exitCode: 0,
            stdout: 'a b\n'
        }, 'mock standard I/O streams')
    }
    {
        const Messenger = require('../messenger')
        const messaged = require('./fixtures/messaged')
        const child = messaged({}, { messenger: new Messenger })
        child.options.messenger.emit('message', { method: 'ignore' })
        child.options.messenger.emit('message', { method: 'shutdown' })
        okay(await child.exit, 0, 'mock ipc')
    }
    {
        const LANG = process.env.LANG
        process.env.LANG = 'fr_FR'
        const language = require('./fixtures/language')
        const child = language({})
        if (LANG != null) {
            process.env.LANG = LANG
        } else {
            delete process.env.LANG
        }
        okay(await child.exit, 'fr_FR', 'language from environment')
    }
    {
        const optional = require('./fixtures/optional')
        const child = optional([])
        okay(await child.exit, process.pid, 'default property return')
    }
    {
        const optional = require('./fixtures/optional')
        const child = optional([], { pid: 2 })
        okay(await child.exit, 2, 'override property return')
    }
    {
        const events = require('events')
        const signaled = require('./fixtures/signaled')
        const child = signaled([], { $signals: new events.EventEmitter })
        child.options.$signals.emit('SIGHUP') // Should do nothing.
        child.options.$signals.emit('SIGTERM')
        okay(await child.exit, 'SIGTERM', 'specify signal handling')
    }
    {
        const events = require('events')
        const signaled = require('./fixtures/signaled')
        const child = signaled([], { $signals: new events.EventEmitter, $trap: false })
        child.options.$signals.emit('SIGINT')
        child.destroy(0)
        okay(await child.exit, 0, 'override all defined signal handlers to no signal handler')
    }
    {
        const events = require('events')
        const signaled = require('./fixtures/signaled')
        const child = signaled([], { $signals: new events.EventEmitter, $trap: true })
        child.options.$signals.emit('SIGINT')
        // **TODO** I can never remember how destroy works, why `0`?
        child.destroy(0)
        okay(await child.exit, 'SIGINT', 'inverse of the trap off-switch')
    }
    {
        const events = require('events')
        const signaled = require('./fixtures/signaled')
        const child = signaled([], { $signals: new events.EventEmitter, $trap: 'swallow' })
        child.options.$signals.emit('SIGINT')
        child.destroy(0)
        okay(await child.exit, 0, 'all traps set to same action')
    }
    {
        // Also tests untrap as false.
        const events = require('events')
        const signaled = require('./fixtures/main')
        const child = signaled([], { $signals: new events.EventEmitter, $isMainModule: true })
        child.destroy(0)
        okay(await child.exit, 'is main module')
        okay(child.options.$signals.listenerCount('SIGINT'), 1, 'fake main module')
    }
    {
        const events = require('events')
        const signaled = require('./fixtures/main')
        const child = signaled([], { $signals: new events.EventEmitter, $isMainModule: true, $untrap: true })
        child.destroy(0)
        okay(await child.exit, 'is main module')
        okay(child.options.$signals.listenerCount('SIGINT'), 0, 'fake main module wihtout setting traps')
    }
    {
        const test = [], data = []
        const path = require('path')
        const children = require('child_process')
        const child = children.spawn('node', [ path.join(__dirname, 'fixtures/piped') ], {
            stdio: [ 'inherit', 'inherit', 'inherit', 'pipe' ]
        })
        child.stdio[3].on('data', buffer => data.push(buffer))
        child.stdio[3].on('end', () => test.push(Buffer.concat(data).toString()))
        await new Promise(resolve => child.stdio[3].once('end', resolve))
        okay(test, [ 'piped\n' ], 'create streams for parent/child pipes')
    }
    {
        const stream = require('stream')
        const piped = require('./fixtures/piped')
        const child = piped([], { $pipes: { 3: new stream.PassThrough }, $isMainModule: true })
        okay(await child.exit, 0, 'exit')
        okay(child.options.$pipes[3].read().toString(), 'piped\n', 'mock parent child pipes')
    }
    {
        const test = []
        const abend = require('./fixtures/abend')
        try {
            await abend([]).exit
        } catch (error) {
            test.push(error.exitCode)
        }
        okay(test, [ 1 ], 'propagate exceptions that should be converted to formatted errors')
    }
    {
        const args = require('./fixtures/arguments')
        okay(await args([{ name: 'value' }], {}).exit, { name: 'value' }, 'accept array of name/value pairs as arguments')
    }
    {
        const args = require('./fixtures/arguments')
        okay(await args([ '-t' ], {}).exit, { toggle: true }, 'short toggle arguments')
    }
    {
        const args = require('./fixtures/arguments')
        okay(await args([ '-t', '-t' ], {}).exit, { toggle: false }, 'tally short toggle arguments')
    }
    {
        const args = require('./fixtures/arguments')
        okay(await args([ '--no-toggle' ], {}).exit, { toggle: false }, 'negate long toggle arguments')
    }
    {
        const args = require('./fixtures/arguments')
        okay(await args([ '-t', '--no-toggle', '-t' ], {}).exit, { toggle: true }, 'negate long toggle arguments then tally')
    }
    {
        const args = require('./fixtures/arguments')
        okay(await args({ toggle: true }, {}).exit, { toggle: true }, 'accept toggle argumetns from an object')
    }
    {
        const args = require('./fixtures/arguments')
        okay(await args({ toggle: false }, {}).exit, { toggle: false }, 'accept a false toggle argument from an object')
    }
})
