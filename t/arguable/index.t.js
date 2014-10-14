#!/usr/bin/env node

require('proof')(2, require('cadence')(function (async, assert) {
    var echo = require('./fixtures/echo')
    var stream = require('stream')
    var stdout = new stream.PassThrough
    var chunks = []
    async(function () {
        stdout.on('data', function (data) { chunks.push(data.toString()) })
        echo({}, [ 'a', 'b' ], { stdout: stdout }, async())
    }, function () {
        assert(1, 'called back')
        assert(chunks.join(''), 'a b\n', 'executable')
    })
}))
