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
    ___ . ___
*/

var stream = require('stream'),
    events = require('events'),
    path = require('path'),
    cadence = require('cadence')

function prove (async, assert) {
    var usage = 'usage: basic [options] [files]\n' +
                '    -c, --config <key=value>\n' +
                '        --longonly\n' +
                ''
    var createProgram = require('../../program.js'), io
    createProgram(path.join(__dirname, 'endless.js'), {}, [], {}, cadence(function (async, program) {
    }), function (error, code) {
        assert(error.message, 'no usage found', 'no usage found')
    })
    createProgram(__filename, {}, [], {}, cadence(function (async, program) {
        return 0
    }), function (error, code) {
        if (error) throw error
        assert(code, 0, 'exit zero')
    })
    createProgram(__filename, {}, [], {}, cadence(function (async, program) {
        throw new Error('raw')
    }), function (error) {
        assert(error.message, 'raw', 'raw exception')
    })
    createProgram(__filename, {}, [], io = {
        stderr: new stream.PassThrough
    }, cadence(function (async, program) {
        program.abend('badness')
    }), function (error) {
        assert(error.message, 'abend', 'official message')
        assert(error.context.message, 'A bad thing happened.', 'error')
        assert(error.context.code, 1, 'error code')
    })
    createProgram(__filename, {}, [], io = {
    }, cadence(function (async, program) {
        program.abend()
    }), function (error) {
        assert(!error.context.message, 'messageless error')
        assert(error.context.code, 1, 'messageless error code')
    })
    createProgram(__filename, {}, [], io = {
        stderr: new stream.PassThrough
    }, cadence(function (async, program) {
        program.abend(127, 'badness')
    }), function (error, code) {
        assert(error.context.message, 'A bad thing happened.', 'error with code')
        assert(error.context.code, 127, 'code for error with code')
    })
    createProgram(__filename, {}, [], io = {
        stderr: new stream.PassThrough
    }, cadence(function (async, program) {
        program.abend('nogoodness')
    }), function (error, code) {
        assert(error.context.message, 'nogoodness', 'error string missing')
        assert(error.context.code, 1, 'error string missing code')
    })
    createProgram(__filename, {}, [ '-x' ], io = {
        stderr: new stream.PassThrough
    }, cadence(function (async, program) {
        program.abend('nogoodness')
        return 0
    }), function (error, code) {
        assert(error.context.message, 'unknown argument', 'unknown argument')
        assert(error.context.code, 1, 'unknown argument code')
    })
    createProgram(__filename, {}, [], io = {
    }, cadence(function (async, program) {
        program.exit(0)
        return 0
    }), function (error, code) {
        assert(error.context.code, 0, 'normal exit')
    })
    createProgram(__filename, {}, [], {}, cadence(function (async, program) {
        program.help()
    }), function (error) {
        assert(error.context.message + '\n', usage, 'help')
    })
    createProgram(__filename, {}, [], {}, cadence(function (async, program) {
        program.helpIf(true)
    }), function (error) {
        assert(error.message, 'help', 'help if')
    })
    createProgram(__filename, {}, [], {}, cadence(function (async, program) {
        program.helpIf(false)
    }), function (error) {
        assert(!error, 'help if not')
    })
    createProgram(path.join(__dirname, 'sub.js'), {}, [], io = {
        stderr: new stream.PassThrough
    }, cadence(function (async, program) {
        return 0
    }), function (error, code) {
        assert(error.context.message, 'command required', 'command missing')
    })
    createProgram(path.join(__dirname, 'sub.js'), {}, [ 'run', '-p', 3, 'x' ],  {
    }, cadence(function (async, program) {
        assert(program.argv, [ 'x' ], 'correct sub command argv')
        assert(program.param.processes, 3, 'correct sub command arguments pattern')
        return 0
    }), function (error, code) {
        if (error) throw error
        assert(code, 0, 'sub command normal exit')
    })
    createProgram(path.join(__dirname, 'sub.js'), {}, [ 'run', '-l', 3 ],  {
    }, cadence(function (async, program) {
        program.required('level', 'processes')
    }), function (error) {
        assert(error.context.message, 'processes is required', 'required')
    })
    createProgram(path.join(__dirname, 'sub.js'), {}, [ 'run', '-p', 3, '-l', 'x' ],  {
    }, cadence(function (async, program) {
        program.validate('%s is not an integer', 'processes', /^\d+$/)
        program.validate('%s is not copacetic', 'level', function () { return true })
        program.validate('%s is not an integer', 'other', 'level', /^\d+$/)
    }), function (error) {
        assert(error.context.message, 'level is not an integer', 'validate')
    })
    createProgram(path.join(__dirname, 'sub.js'), {}, [ 'run', '-p', 3, '-l', 'x' ],  {
    }, cadence(function (async, program) {
        program.numeric('processes', 'level')
    }), function (error) {
        assert(error.context.message, 'level is not numeric', 'numeric')
    })
    createProgram(__filename, {}, [],  {
    }, cadence(function (async, program) {
        assert(program.format('ordered', 'this', 'that'), 'First that then this.', 'ordered format')
        assert(program.format('unordered', 'this', 'that'), 'First this then that.', 'unordered format')
    }), function (error, code) {
        if (error) throw error
    })
    createProgram(__filename, {}, [], io = {
        events: new events.EventEmitter
    }, cadence(function (async, program) {
        var callback = async()
        program.signal('SIGINT', function () { callback() })
    }), function (error, code) {
        if (error) throw error
        assert(code, 0, 'signal handler')
    })
    io.events.emit('SIGINT')
}

require('proof')(28, cadence(prove))
