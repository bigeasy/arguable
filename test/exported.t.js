require('proof')(22, require('cadence')(prove))

function prove (async, okay) {
    var send = require('./fixtures/send')
    var optional = require('./fixtures/optional')
    var args = require('./fixtures/arguments')
    var main = require('./fixtures/main')
    var stream = require('stream')
    var events = require('events')
    var stdout
    var chunks
    var ee
    async(function () {
        var events = require('events')
        var identified = require('./fixtures/identified')
        async(function () {
            identified({}, async())
        }, function (identifier) {
            okay(identifier, [ 1 ], 'set identifier')
        })
    }, function () {
        var events = require('events')
        var errored = require('./fixtures/errored')
        async([function () {
            errored({}, async())
        }, function (error) {
            okay(/^destructible#error$/m.test(error.message), 'error from constructor')
        }])
    }, function () {
        var stream = require('stream')
        var echo = require('./fixtures/echo')
        async(function () {
            echo([ 'a', 'b' ], {
                $stdout: new stream.PassThrough
            }, async())
        }, function (child) {
            async(function () {
                child.exit(async())
            }, function () {
                okay(child.options.$stdout.read().toString(), 'a b\n', 'echo')
            })
        })
    }, function () {
        var messaged = require('./fixtures/messaged')
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
        okay(true, 'direct ee called back')
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
        var events = require('events')
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
