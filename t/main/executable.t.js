#!/usr/bin/env node

require('proof')(2, function (ok, equal) {
    var echo = require('./fixtures/echo')
    var stream = require('stream')
    var stdout = new stream.PassThrough
    var chunks = []
    stdout.on('data', function (data) { chunks.push(data.toString()) })
    echo([ 'a', 'b' ], stdout, null, null, function () {
        ok(1, 'called back')
    })
    equal(chunks.join(''), 'a b\n', 'executable')
})
