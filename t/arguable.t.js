require('proof')(13, require('cadence')(prove))

function prove (async, assert) {
    var echo1 = require('./fixtures/echo-1')
    var echo2 = require('./fixtures/echo-2')
    var send = require('./fixtures/send')
    var parameters = require('./fixtures/parameters')
    var disconnect = require('./fixtures/disconnect')
    var main = require('./fixtures/main')
    var stream = require('stream')
    var events = require('events')
    var stdout
    var chunks
    var ee
    async(function () {
        stdout = new stream.PassThrough
        chunks = []
        stdout.on('data', function (data) { chunks.push(data.toString()) })
        echo1([ 'a', 'b' ], { stdout: stdout }, async())
    }, function () {
        assert(true, 'echo 1 called back')
        assert(chunks.join(''), 'a b\n', 'echo 1 executed')
        ee = new events.EventEmitter
        ee.stdout = new stream.PassThrough
        chunks = []
        ee.stdout.on('data', function (data) { chunks.push(data.toString()) })
        echo1([ 'a', 'b' ], ee, async())
    }, function () {
        assert(chunks.join(''), 'a b\n', 'echo 1 direct ee executed')
        stdout = new stream.PassThrough
        chunks = []
        stdout.on('data', function (data) { chunks.push(data.toString()) })
        echo2([ 'a', 'b' ], { stdout: stdout }, async())
    }, function () {
        assert(true, 'echo 2 called back')
        assert(chunks.join(''), 'a b\n', 'echo 2 executed')
        var ee = new events.EventEmitter
        ee.send = function (message) { assert(message, { key: 'value' }, 'send') }
        send([], { events: ee }, async())
    }, function () {
        assert(true, 'direct ee called back')
        parameters({}, async())
    }, function (result, argv, property) {
        assert(property, 1, 'default property')
        parameters({}, { attributes: { property: 2 } },  async())
    }, function (result, argv, property) {
        assert(property, 2, 'override default property')
        var program = main([], {}, async())
        assert(program.mainModule === process.mainModule, 'default main module')
    }, function (isMainModule) {
        assert(isMainModule, false, 'main module')
        main([], { isMainModule: true }, async())
    }, function (isMainModule) {
        assert(isMainModule, true, 'is main module')
        disconnect([], { connected: true }, async())
    }, function (connected) {
        assert(connected, false, 'disconected')
    })
}
