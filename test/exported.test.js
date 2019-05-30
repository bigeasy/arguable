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
})
return
require('proof')(29, require('cadence')(prove))

function prove (async, okay) {
    async(function () {
        var Messenger = require('../messenger')
        var stream = require('stream')
        async(function () {
            messaged({}, { $stdout: new stream.PassThrough, messenger: new Messenger }, async())
        }, function (child) {
            child.options.messenger.emit('message', { method: 'shutdown' })
            async(function () {
                child.exit(async())
            }, function () {
                okay(child.options.$stdout.read().toString(), 'shutdown\n', 'send')
            })
        })
    }, function () {
        var language = require('./fixtures/language')
        var LANG = process.env.LANG
        async(function () {
            process.env.LANG = 'fr_FR'
            language({}, {}, async())
        }, function (lang, child) {
            if (LANG != null) {
                process.env.LANG = LANG
            } else {
                delete process.env.LANG
            }
            okay(lang, 'fr_FR', 'language from environment')
            child.exit(async())
        })
    }, function () {
        var optional = require('./fixtures/optional')
        async(function () {
            optional({}, async())
        }, function (pid, child) {
            okay(pid, process.pid, 'default property return')
            async(function () {
                child.exit(async())
                child.destroy()
            }, function (exitCode, pid) {
                okay({
                    exitCode: exitCode,
                    pid: pid
                }, {
                    exitCode: 0,
                    pid: process.pid
                },  'default property exit')
            })
        })
    }, function () {
        var optional = require('./fixtures/optional')
        async(function () {
            optional({}, { pid: 2 },  async())
        }, function (pid, child) {
            okay(pid, 2, 'override default property return')
            async(function () {
                child.exit(async())
                child.destroy()
            }, function (exitCode, pid) {
                okay({
                    exitCode: exitCode,
                    pid: pid
                }, {
                    exitCode: 0,
                    pid: 2
                },  'override default pid exit')
            })
        })
    }, function () {
        var events = require('events')
        var signaled = require('./fixtures/signaled')
        async(function () {
            signaled({}, {
                $signals: new events.EventEmitter
            }, async())
        }, function (destructed, child) {
            child.options.$signals.once('SIGINT', function () {
                okay('SIGINT swallowed')
            })
            okay(!destructed[0], 'SIGINT did not destroy')
            child.options.$signals.emit('SIGHUP') // Should do nothing.
            okay(!destructed[0], 'SIGHUP did not destroy')
            async(function () {
                child.exit(async())
                child.options.$signals.emit('SIGTERM')
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
    }, function () {
        var scrammed = require('./fixtures/scrammed')
        async(function () {
            scrammed({}, { $scram: 2000 }, async())
        }, function (scram, child) {
            okay(scram, 2000, 'scram as integer')
            child.exit(async())
        })
    }, function () {
        var scrammed = require('./fixtures/scrammed')
        async(function () {
            scrammed({ scram: '2000' }, { $scram: 'scram' }, async())
        }, function (scram, child) {
            okay(scram, 2000, 'scram as argument')
            child.exit(async())
        })
    }, function () {
        var scrammed = require('./fixtures/scrammed')
        async(function () {
            scrammed({}, { $scram: { scram: 2000 } }, async())
        }, function (scram, child) {
            okay(scram, 2000, 'scram as argument with default')
            child.exit(async())
        })
    })
}
