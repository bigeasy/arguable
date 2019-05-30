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
})
return
require('proof')(29, require('cadence')(prove))

function prove (async, okay) {
    async(function () {
        var events = require('events')
        async(function () {
            signaled({}, {
                $signals: new events.EventEmitter
            }, async())
        }, function (destructed, child) {
            okay(!destructed[0], 'SIGINT did not destroy')
            okay(!destructed[0], 'SIGHUP did not destroy')
            async(function () {
                child.exit(async())
            }, function (exitCode) {
                okay({
                    exitCode: exitCode,
                    destructed: destructed[0]
                }, {
                    exitCode: 0,
                    destructed: true
                },  'SIGTERM did destroy')
            })
        })
    }, function () {
        var events = require('events')
        var signaled = require('./fixtures/signaled')
        async(function () {
            signaled({}, {
                $signals: new events.EventEmitter,
                $trap: false
            }, async())
        }, function (destructed, child) {
            okay(child.options.$signals.listenerCount('SIGINT'), 0, 'no traps')
            child.options.$signals.emit('SIGINT')
            okay(!destructed[0], 'SIGINT did not destroy')
            child.destroy()
            child.exit(async())
        })
    }, function () {
        var events = require('events')
        var signaled = require('./fixtures/signaled')
        async(function () {
            signaled({}, {
                $signals: new events.EventEmitter,
                $trap: true
            }, async())
        }, function (destructed, child) {
            okay(child.options.$signals.listenerCount('SIGINT'), 1, 'has a SIGINT trap')
            child.options.$signals.emit('SIGINT')
            okay(destructed[0], 'SIGINT destroyed')
            child.destroy()
            child.exit(async())
        })
    }, function () {
        var events = require('events')
        var signaled = require('./fixtures/signaled')
        async(function () {
            signaled({}, {
                $signals: new events.EventEmitter,
                $trap: 'swallow'
            }, async())
        }, function (destructed, child) {
            okay(child.options.$signals.listenerCount('SIGINT'), 1, 'string $trap has a SIGINT trap')
            child.options.$signals.emit('SIGINT')
            okay(!destructed[0], 'string $trap SIGINT not destroyed')
            child.destroy()
            child.exit(async())
        })
    }, function () {
        // Also tests untrap as false.
        var main = require('./fixtures/main')
        var events = require('events')
        async(function () {
            main({}, {
                $signals: new events.EventEmitter,
                $isMainModule: true
            }, async())
        }, function (isMainModule, child) {
            okay(isMainModule, 'is main module')
            okay(child.options.$signals.listenerCount('SIGINT'), 1, 'main module still trapped')
            child.exit(async())
        })
    }, function () {
        var path = require('path')
        var children = require('child_process')
        var child = children.spawn('node', [ path.join(__dirname, 'fixtures/piped') ], {
            stdio: [ 'inherit', 'inherit', 'inherit', 'pipe' ]
        })
        child.stdio[3].on('data', function (buffer) {
            okay(buffer.toString(), 'piped\n', 'piped')
        })
        child.stdio[3].on('end', async())
    }, function () {
        var piped = require('./fixtures/piped')
        var stream = require('stream')
        async(function () {
            piped([], {
                $pipes: { 3: new stream.PassThrough },
                $isMainModule: true
            }, async())
        }, function (child) {
            async(function () {
                child.exit(async())
            }, function () {
                okay(child.options.$pipes[3].read().toString(), 'piped\n', 'psuedo piped')
            })
        })
    }, function () {
        // Also tests untrap as false.
        var main = require('./fixtures/main')
        var events = require('events')
        async(function () {
            main({}, {
                $signals: new events.EventEmitter,
                $isMainModule: true,
                $untrap: true
            }, async())
        }, function (isMainModule, child) {
            okay(isMainModule, 'is still main module')
            okay(child.options.$signals.listenerCount('SIGINT'), 0, 'main module untrapped')
            child.exit(async())
        })
    }, function () {
        // Also tests untrap as false.
        var abend = require('./fixtures/abend')
        async([function () {
            abend({}, async())
        }, function (error) {
            okay(error.exitCode, 1, 'abend exit code')
            return [ async.return ]
        }], function () {
            throw new Error('abend expected')
        })
    }, function () {
        var args = require('./fixtures/arguments')
        async(function () {
            args([{ name: 'value' }], {}, async())
        }, function (name, child) {
            okay(name, 'value', 'disconected')
            child.exit(async())
        })
    })
}
