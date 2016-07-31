require('proof')(12, require('cadence')(prove))

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
    async(function () {
        stdout = new stream.PassThrough
        chunks = []
        stdout.on('data', function (data) { chunks.push(data.toString()) })
        echo1([ 'a', 'b' ], { stdout: stdout }, async())
    }, function () {
        assert(true, 'echo 1 called back')
        assert(chunks.join(''), 'a b\n', 'echo 1 executed')
    }, function () {
        stdout = new stream.PassThrough
        chunks = []
        stdout.on('data', function (data) { chunks.push(data.toString()) })
        echo2([ 'a', 'b' ], { stdout: stdout }, async())
    }, function () {
        var ee = new events.EventEmitter
        ee.send = function (message) { assert(message, { key: 'value' }, 'send') }
        assert(true, 'echo 2 called back')
        assert(chunks.join(''), 'a b\n', 'echo 2 executed')
        send([], { events: ee }, async())
    }, function () {
        assert(true, 'send called back')
        parameters({ two: 3 }, {}, async())
    }, function (result) {
        assert(result, { one: 1, two: 3 }, 'parameter overwrite, single object argv')
        parameters([{ name: 'name', value: 'value' }], {}, async())
    }, function (result) {
        assert(result, { one: 1, two: 2, name: 'value' }, 'name value argument')
        parameters([[{ three: 3 }]], {}, async())
    }, function (result) {
        assert(result, { one: 1, two: 2, three: 3 }, 'nested array argument')
        main([], {}, async())
    }, function (result) {
        assert(result === process.mainModule, 'main module')
        main([], { mainModule: main }, async())
    }, function (result) {
        assert(result === main, 'main module mocked')
        disconnect([], { connected: true }, async())
    }, function (connected) {
        assert(connected, false, 'disconected')
    })
}
