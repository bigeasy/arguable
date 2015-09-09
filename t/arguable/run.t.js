#!/usr/bin/env node

/*
    ___ usage ___ en_US ___
    usage: basic [options] [files]
        -c, --config <key=value>
            --longonly
    ___ $ ___ en_US ___
    badness: A bad thing happened.
    ordered(2, 1): First %s then %s.
    unordered: First %s then %s.
    ___ ___ ___
*/

var stream = require('stream'),
    events = require('events'),
    path = require('path'),
    cadence = require('cadence')

var prove = cadence(function (async, assert) {
    var usage = 'usage: basic [options] [files]\n' +
                '    -c, --config <key=value>\n' +
                '        --longonly\n' +
                ''
    var run = require('../../invoke'), io
    run(path.join(__dirname, 'endless.js'), {}, [], {}, cadence(function (async, options) {
    }), function (error, code) {
        assert(error.message, 'no usage found', 'no usage found')
    })
    run(__filename, {}, [], {}, cadence(function (async, options) {
        return 0
    }), function (error, code) {
        if (error) throw error
        assert(code, 0, 'exit zero')
    })
    run(__filename, {}, [], {}, cadence(function (async, options) {
        throw new Error('raw')
    }), function (error) {
        assert(error.message, 'raw', 'raw exception')
    })
    run(__filename, {}, [], io = {
        stderr: new stream.PassThrough
    }, cadence(function (async, options) {
        options.abend('badness')
    }), function (error) {
        assert(error.message, 'abend', 'official message')
        assert(error.context.message, 'A bad thing happened.', 'error')
        assert(error.context.code, 1, 'error code')
    })
    run(__filename, {}, [], io = {
    }, cadence(function (async, options) {
        options.abend()
    }), function (error) {
        assert(!error.context.message, 'messageless error')
        assert(error.context.code, 1, 'messageless error code')
    })
    run(__filename, {}, [], io = {
        stderr: new stream.PassThrough
    }, cadence(function (async, options) {
        options.abend(127, 'badness')
    }), function (error, code) {
        assert(error.context.message, 'A bad thing happened.', 'error with code')
        assert(error.context.code, 127, 'code for error with code')
    })
    run(__filename, {}, [], io = {
        stderr: new stream.PassThrough
    }, cadence(function (async, options) {
        options.abend('nogoodness')
    }), function (error, code) {
        assert(error.context.message, 'nogoodness', 'error string missing')
        assert(error.context.code, 1, 'error string missing code')
    })
    run(__filename, {}, [ '-x' ], io = {
        stderr: new stream.PassThrough
    }, cadence(function (async, options) {
        options.abend('nogoodness')
        return 0
    }), function (error, code) {
        assert(error.context.message, 'unknown argument', 'unknown argument')
        assert(error.context.code, 1, 'unknown argument code')
    })
    run(__filename, {}, [], io = {
    }, cadence(function (async, options) {
        options.exit(0)
        return 0
    }), function (error, code) {
        assert(error.context.code, 0, 'normal exit')
    })
    run(__filename, {}, [], io = {
        stdout: new stream.PassThrough
    }, cadence(function (async, options) {
        options.help()
    }), function (error) {
        assert(error.context.message + '\n', usage, 'help')
    })
    run(path.join(__dirname, 'sub.js'), {}, [], io = {
        stderr: new stream.PassThrough
    }, cadence(function (async, options) {
        return 0
    }), function (error, code) {
        assert(error.context.message, 'command required', 'command missing')
    })
    run(path.join(__dirname, 'sub.js'), {}, [ 'run', '-p', 3 ],  {
    }, cadence(function (async, options) {
        assert(options.param.processes, 3, 'correct sub command arguments pattern')
        return 0
    }), function (error, code) {
        if (error) throw error
        assert(code, 0, 'sub command normal exit')
    })
    run(__filename, {}, [],  {
    }, cadence(function (async, options) {
        assert(options.format('ordered', 'this', 'that'), 'First that then this.', 'ordered format')
        assert(options.format('unordered', 'this', 'that'), 'First this then that.', 'unordered format')
    }), function (error, code) {
        if (error) throw error
    })
    run(__filename, {}, [], io = {
        events: new events.EventEmitter
    }, cadence(function (async, options) {
        var callback = async()
        options.signal('SIGINT', function () { callback() })
    }), function (error, code) {
        if (error) throw error
        assert(code, 0, 'signal handler')
    })
    io.events.emit('SIGINT')
})

require('proof')(22, prove)
