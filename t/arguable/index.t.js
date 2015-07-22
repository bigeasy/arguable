#!/usr/bin/env node

require('proof')(4, require('cadence')(function (async, assert) {
    var echo1 = require('./fixtures/echo-1')
    var echo2 = require('./fixtures/echo-2')
    var stream = require('stream')
    var stdout
    var chunks
    async(function () {
        stdout = new stream.PassThrough
        chunks = []
        stdout.on('data', function (data) { chunks.push(data.toString()) })
        echo1({}, [ 'a', 'b' ], { stdout: stdout }, async())
    }, function () {
        assert(1, 'called back')
        assert(chunks.join(''), 'a b\n', 'executable')
    }, function () {
        stdout = new stream.PassThrough
        chunks = []
        stdout.on('data', function (data) { chunks.push(data.toString()) })
        echo2({}, [ 'a', 'b' ], { stdout: stdout }, async())
    }, function () {
        assert(1, 'called back')
        assert(chunks.join(''), 'a b\n', 'executable')
    })
}))
