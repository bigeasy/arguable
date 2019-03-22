require('proof')(20, require('cadence')(prove))

function prove (async, okay) {
    var echo1 = require('./fixtures/echo-1')
    var echo2 = require('./fixtures/echo-2')
    var send = require('./fixtures/send')
    var optional = require('./fixtures/optional')
    var disconnect = require('./fixtures/disconnect')
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
        stdout = new stream.PassThrough
        chunks = []
        stdout.on('data', function (data) { chunks.push(data.toString()) })
        echo1([ 'a', 'b' ], { stdout: stdout }, async())
    }, function () {
        okay(true, 'echo 1 called back')
        okay(chunks.join(''), 'a b\n', 'echo 1 executed')
        ee = new events.EventEmitter
        ee.stdout = new stream.PassThrough
        chunks = []
        ee.stdout.on('data', function (data) { chunks.push(data.toString()) })
        echo1([ 'a', 'b' ], ee, async())
    }, function () {
        okay(chunks.join(''), 'a b\n', 'echo 1 direct ee executed')
        stdout = new stream.PassThrough
        chunks = []
        stdout.on('data', function (data) { chunks.push(data.toString()) })
        echo2([ 'a', 'b' ], { stdout: stdout }, async())
    }, function () {
        okay(true, 'echo 2 called back')
        okay(chunks.join(''), 'a b\n', 'echo 2 executed')
        var ee = new events.EventEmitter
        ee.send = function (message) { okay(message, { key: 'value' }, 'send') }
        send([], { events: ee }, async())
    }, function () {
        okay(true, 'direct ee called back')
    }, function () {
        async(function () {
        optional({}, async())
        }, function (property, child) {
            okay(property, 1, 'default property return')
            async(function () {
                child.exit(async())
                child.destroy()
            }, function (exitCode, property) {
                okay({
                    exitCode: exitCode,
                    property: property
                }, {
                    exitCode: 0,
                    property: 1
                },  'default property exit')
            })
        })
    }, function () {
        optional({}, { attributes: { property: 2 } },  async())
    }, function (property) {
        okay(property, 2, 'override default property')
    }, function () {
        var events = require('events')
        var signaled = require('./fixtures/signaled')
        async(function () {
            signaled({}, {
                $signals: new events.EventEmitter
            }, async())
        }, function (destructed, child, options) {
            options.$signals.once('SIGINT', function () {
                okay('SIGINT swallowed')
            })
            okay(!destructed[0], 'SIGINT did not destroy')
            options.$signals.emit('SIGHUP') // Should do nothing.
            okay(!destructed[0], 'SIGHUP did not destroy')
            async(function () {
                child.exit(async())
                options.$signals.emit('SIGTERM')
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
        var program = main([], {}, async())
        okay(program.mainModule === process.mainModule, 'default main module')
    }, function (isMainModule) {
        okay(isMainModule, false, 'main module')
        main([], { isMainModule: true }, async())
    }, function (isMainModule) {
        okay(isMainModule, true, 'is main module')
        disconnect([], { connected: true }, async())
    }, function (connected) {
        okay(connected, false, 'disconected')
        args([{ name: 'value' }], {}, async())
    }, function (name) {
        okay(name, 'value', 'disconected')
    })
}
