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

var stream = require('stream'),
    path = require('path'),
    cadence = require('cadence')

require('proof')(14, cadence(function (async, assert) {
    var usage = 'usage: basic [options] [files]\n' +
                '    -c, --config <key=value>\n' +
                '        --longonly\n' +
                ''
    var redux = require('../../run'), io
    redux(path.join(__dirname, 'endless.js'), {}, [], {}, cadence(function (async, options) {
    }), function (error, code) {
        assert(error.message, 'no usage found', 'no usage found')
    })
    redux(__filename, {}, [], {}, cadence(function (async, options) {
    }), function (error, code) {
        if (error) throw error
        assert(code, 0, 'exit zero')
    })
    redux(__filename, {}, [], {}, cadence(function (async, options) {
        throw new Error('raw')
    }), function (error) {
        assert(error.message, 'raw', 'raw exception')
    })
    redux(__filename, {}, [], io = {
        stderr: new stream.PassThrough
    }, cadence(function (async, options) {
        options.abend('badness')
    }), function (error, code) {
        if (error) throw error
        assert(io.stderr.read().toString(), 'A bad thing happened.\n', 'error')
        assert(code, 1, 'error code')
    })
    redux(__filename, {}, [], io = {
        stderr: new stream.PassThrough
    }, cadence(function (async, options) {
        options.abend('nogoodness')
    }), function (error, code) {
        if (error) throw error
        assert(io.stderr.read().toString(), 'nogoodness\n', 'error string missing')
        assert(code, 1, 'error string missing code')
    })
    redux(__filename, {}, [ '-x' ], io = {
        stderr: new stream.PassThrough
    }, cadence(function (async, options) {
        options.abend('nogoodness')
    }), function (error, code) {
        assert(io.stderr.read().toString(), 'unknown argument\n', 'unknown argument')
        assert(code, 1, 'unknown argument code')
    })
    redux(__filename, {}, [], io = {
    }, cadence(function (async, options) {
        options.exit(0)
    }), function (error, code) {
        if (error) throw error
        assert(code, 0, 'normal exit')
    })
    redux(__filename, {}, [], io = {
        stdout: new stream.PassThrough
    }, cadence(function (async, options) {
        options.help()
    }), function (error) {
        assert(io.stdout.read().toString(), usage, 'help')
    })
    redux(path.join(__dirname, 'sub.js'), {}, [], io = {
        stderr: new stream.PassThrough
    }, cadence(function (async, options) {
    }), function (error, code) {
        assert(io.stderr.read().toString(), 'command required\n', 'command missing')
    })
    redux(path.join(__dirname, 'sub.js'), {}, [ 'run', '-p', 3 ],  {
    }, cadence(function (async, options) {
        assert(options.params.processes, 3, 'correct sub command arguments pattern')
    }), function (error, code) {
        if (error) throw error
        assert(code, 0, 'sub command normal exit')
    })
}))
