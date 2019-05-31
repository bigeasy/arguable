describe('exported', () => {
    const assert = require('assert')
    it('can propagate an error', async () => {
        const test = []
        const errored = require('./fixtures/errored')
        const child = errored([])
        try {
            await child.promise
        } catch (error) {
            test.push(error.message)
        }
        assert.deepStrictEqual(test, [ 'panic' ], 'caught')
    })
    it('can mock standard I/O streams', async () => {
        const stream = require('stream')
        const echo = require('./fixtures/echo')
        const child = echo([ 'a', 'b' ], { $stdout: new stream.PassThrough })
        assert.equal(await child.promise, 0, 'exit')
        assert.equal(child.options.$stdout.read().toString(), 'a b\n', 'stdout')
    })
    it('can mock ipc', async () => {
        const Messenger = require('../messenger')
        const messaged = require('./fixtures/messaged')
        const child = messaged({}, { messenger: new Messenger })
        child.options.messenger.emit('message', { method: 'ignore' })
        child.options.messenger.emit('message', { method: 'shutdown' })
        assert.equal(await child.promise, 0, 'exit')
    })
    it('can choose a language based on environment', async () => {
        const LANG = process.env.LANG
        process.env.LANG = 'fr_FR'
        const language = require('./fixtures/language')
        const child = language({})
        if (LANG != null) {
            process.env.LANG = LANG
        } else {
            delete process.env.LANG
        }
        assert.equal(await child.promise, 'fr_FR', 'language from environment')
    })
    it('can set a default option', async () => {
        const optional = require('./fixtures/optional')
        const child = optional([])
        assert.equal(await child.promise, process.pid, 'default property return')
    })
    it('can override a default option', async () => {
        const optional = require('./fixtures/optional')
        const child = optional([], { pid: 2 })
        assert.equal(await child.promise, 2, 'override property return')
    })
    it('can specify how to respond to the default signals', async () => {
        const events = require('events')
        const signaled = require('./fixtures/signaled')
        const child = signaled([], { $signals: new events.EventEmitter })
        child.options.$signals.emit('SIGHUP') // Should do nothing.
        child.options.$signals.emit('SIGTERM')
        assert.equal(await child.promise, 'SIGTERM', 'signal destroyed')
    })
    it('can override all defined signal handlers to no signal handler', async () => {
        const events = require('events')
        const signaled = require('./fixtures/signaled')
        const child = signaled([], { $signals: new events.EventEmitter, $trap: false })
        child.options.$signals.emit('SIGINT')
        child.destroy(0)
        assert.equal(await child.promise, 0, 'child interface destroyed')
    })
    it('can respect the inverse of the trap off-switch', async () => {
        const events = require('events')
        const signaled = require('./fixtures/signaled')
        const child = signaled([], { $signals: new events.EventEmitter, $trap: true })
        child.options.$signals.emit('SIGINT')
        child.destroy(0)
        assert.equal(await child.promise, 'SIGINT', 'SIGINT destroyed')
    })
    it('can set all traps to the same action', async () => {
        const events = require('events')
        const signaled = require('./fixtures/signaled')
        const child = signaled([], { $signals: new events.EventEmitter, $trap: 'swallow' })
        child.options.$signals.emit('SIGINT')
        child.destroy(0)
        assert.equal(await child.promise, 0, 'child interface destroyed')
    })
    it('can fake being a main module', async () => {
        // Also tests untrap as false.
        const events = require('events')
        const signaled = require('./fixtures/main')
        const child = signaled([], { $signals: new events.EventEmitter, $isMainModule: true })
        child.destroy(0)
        assert(await child.promise, 'is main module')
        assert.equal(child.options.$signals.listenerCount('SIGINT'), 1, 'main module still trapped')
    })
    it('can fake being a main module without setting traps', async () => {
        const events = require('events')
        const signaled = require('./fixtures/main')
        const child = signaled([], { $signals: new events.EventEmitter, $isMainModule: true, $untrap: true })
        child.destroy(0)
        assert(await child.promise, 'is main module')
        assert.equal(child.options.$signals.listenerCount('SIGINT'), 0, 'main module still trapped')
    })
    it('can create streams for parent/child pipes', async () => {
        const test = [], data = []
        const path = require('path')
        const children = require('child_process')
        const child = children.spawn('node', [ path.join(__dirname, 'fixtures/piped') ], {
            stdio: [ 'inherit', 'inherit', 'inherit', 'pipe' ]
        })
        child.stdio[3].on('data', buffer => data.push(buffer))
        child.stdio[3].on('end', () => test.push(Buffer.concat(data).toString()))
        await new Promise(resolve => child.stdio[3].once('end', resolve))
        assert.deepStrictEqual(test, [ 'piped\n' ], 'child pipe')
    })
    it('can mock parent/child pipes', async () => {
        const stream = require('stream')
        const piped = require('./fixtures/piped')
        const child = piped([], { $pipes: { 3: new stream.PassThrough }, $isMainModule: true })
        assert.equal(await child.promise, 0, 'exit')
        assert.equal(child.options.$pipes[3].read().toString(), 'piped\n', 'psuedo piped')
    })
    /*
    it('can filter out exceptions that should be converted to formatted errors', async () => {
        const test = []
        const abend = require('./fixtures/abend')
        try {
            await abend([]).promise
        } catch (error) {
            console.log(error.stack)
            test.push(error.exitCode)
        }
        assert.deepStrictEqual(test, [ 1 ], 'test')
    })
    */
    it('can accept an array of name/value pairs as arguments', async () => {
        const args = require('./fixtures/arguments')
        assert.equal(await args([{ name: 'value' }], {}).promise, 'value', 'exit')
    })
})
