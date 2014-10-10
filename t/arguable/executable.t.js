#!/usr/bin/env node

require('proof')(4, function (assert) {
    var echo = require('./fixtures/echo')
    var stream = require('stream')
    var stdout = new stream.PassThrough
    var chunks = []
    stdout.on('data', function (data) { chunks.push(data.toString()) })
    echo([ 'a', 'b' ], { stdout: stdout }, function () {
        assert(1, 'called back')
    })
    assert(chunks.join(''), 'a b\n', 'executable')
    echo(function () {
        assert(1, 'no arguments')
    })
    chunks.length = 0
    var io = echo([ 'x', 'y', 'z' ])
    io.stdout.on('data', function (data) { chunks.push(data.toString()) })
    assert(chunks.join(''), 'x y z\n', 'default streams')
})
