#!/usr/bin/env node

require('proof')(4, function (ok, equal) {
    var echo = require('./fixtures/echo')
    var stream = require('stream')
    var stdout = new stream.PassThrough
    var chunks = []
    stdout.on('data', function (data) { chunks.push(data.toString()) })
    echo([ 'a', 'b' ], { stdout: stdout }, function () {
        ok(1, 'called back')
    })
    equal(chunks.join(''), 'a b\n', 'executable')
    echo(function () {
        ok(1, 'no arguments')
    })
    chunks.length = 0
    var io = echo([ 'x', 'y', 'z' ])
    io.stdout.on('data', function (data) { chunks.push(data.toString()) })
    equal(chunks.join(''), 'x y z\n', 'default streams')
})
