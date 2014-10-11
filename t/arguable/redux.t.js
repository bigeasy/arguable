#!/usr/bin/env node

/*
    ___ usage: en_US ___
    usage: basic [options] [files]
        -c, --config <key=value> @
            --longonly
    ___ strings ___
    badness: A bad thing happened.
    ___ usage ___
*/

var cadence = require('cadence')
var stream = require('stream')

require('proof')(5, cadence(function (async, assert) {
    var usage = 'usage: basic [options] [files]\n' +
                '    -c, --config <key=value>\n' +
                '        --longonly\n' +
                ''
    var redux = require('../../redux'), io
    redux(__filename, {}, [], {}, cadence(function (async, options) {
        throw new Error('raw')
    }), function (error) {
        assert(error.message, 'raw', 'raw exception')
    })
    redux(__filename, {}, [], io = {
        stderr: new stream.PassThrough
    }, cadence(function (async, options) {
        options.abend('badness')
    }), function (error) {
        if (error) throw error
        assert(io.stderr.read().toString(), 'A bad thing happened.\n', 'error')
    })
    redux(__filename, {}, [], io = {
        stderr: new stream.PassThrough
    }, cadence(function (async, options) {
        options.abend('nogoodness')
    }), function (error) {
        assert(io.stderr.read().toString(), 'nogoodness\n', 'error string missing')
    })
    redux(__filename, {}, [ '-x' ], io = {
        stderr: new stream.PassThrough
    }, cadence(function (async, options) {
        options.abend('nogoodness')
    }), function (error) {
        assert(io.stderr.read().toString(), 'unknown argument\n', 'unknown argument')
    })
    redux(__filename, {}, [], io = {
        stdout: new stream.PassThrough
    }, cadence(function (async, options) {
        options.help()
    }), function (error) {
        assert(io.stdout.read().toString(), usage, 'help')
    })
}))
