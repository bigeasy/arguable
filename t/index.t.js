require('proof')(6, require('cadence')(prove))

function prove (async, assert) {
    var echo1 = require('./fixtures/echo-1')
    var echo2 = require('./fixtures/echo-2')
    var send = require('./fixtures/send')
    var stream = require('stream')
    var events = require('events')
    var stdout
    var chunks
    async(function () {
        stdout = new stream.PassThrough
        chunks = []
        stdout.on('data', function (data) { chunks.push(data.toString()) })
        echo1({}, [ 'a', 'b' ], { stdout: stdout }, async())
    }, function () {
        assert(true, 'echo 1 called back')
        assert(chunks.join(''), 'a b\n', 'echo 1 executed')
    }, function () {
        stdout = new stream.PassThrough
        chunks = []
        stdout.on('data', function (data) { chunks.push(data.toString()) })
        echo2({}, [ 'a', 'b' ], { stdout: stdout }, async())
    }, function () {
        var ee = new events.EventEmitter
        ee.send = function (message) { assert(message, { key: 'value' }, 'send') }
        assert(true, 'echo 2 called back')
        assert(chunks.join(''), 'a b\n', 'echo 2 executed')
        send({}, [], { events: ee }, async())
    }, function () {
        assert(true, 'send called back')
    })
}
