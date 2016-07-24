require('proof')(38, require('cadence')(prove))

/*
    ___ usage ___ en_US ___
    usage: basic [options] [files]
        -c, --config <key=value>
            --longonly
        -l, --level <value>
        -p, --processes <value>
        -b, --bind <address>
    ___ $ ___ en_US ___
    badness: A bad thing happened.
    ordered(2, 1): First %s then %s.
    unordered: First %s then %s.
    ___ . ___
*/

function prove (async, assert) {
    var stream = require('stream'),
        events = require('events'),
        path = require('path'),
        cadence = require('cadence')
    var usage = 'usage: basic [options] [files]\n' +
                '    -c, --config <key=value>\n' +
                '        --longonly\n' +
                '    -l, --level <value>\n' +
                '    -p, --processes <value>\n' +
                '    -b, --bind <address>\n' +
                ''
    var createProgram = require('../program.js'), io
    createProgram(path.join(__dirname, 'endless.js'), {}, [], {}, cadence(function (async, program) {
    }), null, function (error) {
        assert(error.message, 'no usage found', 'no usage found')
    })
    createProgram(__filename, {}, [], io = {
        events: { exitCode: 0 }
    }, cadence(function (async, program) {
        assert(program.exitCode, 0, 'exit code get')
        program.exitCode = 1
        assert(program.exitCode, 1, 'exit code set')
    }), null, function (error) {
        if (error) throw error
        assert(io.events.exitCode, 1, 'exit non-zero')
    })
    createProgram(__filename, {}, [], io = {
        events: { connected: true, disconnect: function () { this.connected = false } }
    }, cadence(function (async, program) {
        assert(program.connected, 'connected')
        program.disconnectIf()
        program.disconnectIf()
        assert(!program.connected, 'not connected')
    }), null, function (error) {
        if (error) throw error
        assert(!io.events.connected, 'exit not connected')
    })
    createProgram(__filename, {}, [], {}, cadence(function (async, program) {
        throw new Error('raw')
    }), null, function (error) {
        assert(error.message, 'raw', 'raw exception')
    })
    createProgram(__filename, {}, [], io = {
        stderr: new stream.PassThrough
    }, cadence(function (async, program) {
        program.abend('badness')
    }), null, function (error) {
        assert(/^bigeasy.arguable#abend$/m.test(error.message), 'official message')
        assert(error.stderr, 'A bad thing happened.', 'error')
        assert(error.exitCode, 1, 'error code')
    })
    createProgram(__filename, {}, [], io = {
    }, cadence(function (async, program) {
        program.abend()
    }), null, function (error) {
        assert(!error.stderr, 'messageless error')
        assert(error.exitCode, 1, 'messageless error code')
    })
    createProgram(__filename, {}, [], io = {
        stderr: new stream.PassThrough
    }, cadence(function (async, program) {
        program.abend(127, 'badness')
    }), null, function (error) {
        assert(error.stderr, 'A bad thing happened.', 'error with code')
        assert(error.exitCode, 127, 'code for error with code')
    })
    createProgram(__filename, {}, [], io = {
        stderr: new stream.PassThrough
    }, cadence(function (async, program) {
        program.assert(true, 'badness')
        program.assert(false, 'badness')
    }), null, function (error) {
        assert(error.stderr, 'A bad thing happened.', 'failed assertion')
    })
    createProgram(__filename, {}, [], io = {
        stderr: new stream.PassThrough
    }, cadence(function (async, program) {
        program.abend('nogoodness')
    }), null, function (error) {
        assert(error.stderr, 'nogoodness', 'error string missing')
        assert(error.exitCode, 1, 'error string missing code')
    })
    createProgram(__filename, {}, [ '-x' ], io = {
        stderr: new stream.PassThrough
    }, cadence(function (async, program) {
        program.abend('nogoodness')
        return 0
    }), null, function (error) {
        assert(error.stderr, 'unknown argument', 'unknown argument')
        assert(error.exitCode, 1, 'unknown argument code')
    })
    createProgram(__filename, {}, [], io = {
    }, cadence(function (async, program) {
        program.exit(0)
        return 0
    }), null, function (error) {
        assert(error.exitCode, 0, 'normal exit')
    })
    createProgram(__filename, {}, [], {}, cadence(function (async, program) {
        program.help()
    }), null, function (error) {
        assert(error.stdout + '\n', usage, 'help')
    })
    createProgram(__filename, {}, [], {}, cadence(function (async, program) {
        program.helpIf(true)
    }), null, function (error) {
        assert(error.method, 'help', 'help if')
    })
    createProgram(__filename, {}, [], {}, cadence(function (async, program) {
        program.helpIf(false)
    }), null, function (error) {
        assert(!error, 'help if not')
    })
    createProgram(__filename, {}, [], {}, cadence(function (async, program) {
        program.delegate('delegated.%s', async())
    }), null, function (error) {
        assert(error.stderr, 'sub command missing', 'sub command missing')
    })
    createProgram(__filename, {}, [
        'found'
    ], {}, cadence(function (async, program) {
        program.delegate('delegated.%s', async())
    }), module, function (error, exitCode) {
        if (error) throw error
        assert(exitCode, 0, 'delegated command normal exit')
    })
    createProgram(__filename, {}, [
        'unfound'
    ], {}, cadence(function (async, program) {
        program.delegate(function (moduleName) { return 'delegated.' + moduleName }, async())
    }), module, function (error) {
        assert(error.stderr, 'sub command not found', 'delgated not found')
    })
    createProgram(__filename, {}, [
        'broken'
    ], {}, cadence(function (async, program) {
        program.delegate('delegated.%s', async())
    }), module, function (error) {
        assert(error.message, 'x is not defined', 'delgated program broken')
    })
    createProgram(__filename, {}, [ '-l', 3 ],  {
    }, cadence(function (async, program) {
        program.required('level', 'processes')
    }), null, function (error) {
        assert(error.stderr, 'processes is required', 'required')
    })
    createProgram(__filename, {}, [ '-p', '3' ],  {
    }, cadence(function (async, program) {
        program.validate('%s is not an integer', 'processes', /^\d+$/)
        assert(program.param.processes, '3', 'successful function validation')
    }), null, function (error) {
        if (error) throw error
    })
    createProgram(__filename, {}, [ '-l', 'x' ],  {
    }, cadence(function (async, program) {
        program.validate('%s is not copacetic', 'level', function (value) {
            return 'x' == value
        })
        assert(program.param.level, 'x', 'successful function validation')
    }), null, function (error) {
        if (error) throw error
    })
    createProgram(__filename, {}, [ '-l', 'x' ],  {
    }, cadence(function (async, program) {
        program.validate(function () { return 'y' }, 'level')
        assert(program.param.level, 'y', 'validator as first argument')
    }), null, function (error) {
        if (error) throw error
    })
    createProgram(__filename, {}, [ '-l', 'x' ],  {
    }, cadence(function (async, program) {
        program.validate('level', function () { return 'y' })
        assert(program.param.level, 'y', 'validator as last argument')
    }), null, function (error) {
        if (error) throw error
    })
    createProgram(__filename, {}, [ '-l', 'x' ],  {
    }, cadence(function (async, program) {
        program.validate('level', function () { throw new Error('thrown') })
    }), null, function (error) {
        assert(error.message, 'thrown', 'rethrow actual error')
    })
    createProgram(__filename, {}, [ '-l', 'x' ],  {
    }, cadence(function (async, program) {
        program.validate('%s is not an integer', 'other', 'level', /^\d+$/)
    }), null, function (error) {
        assert(error.stderr, 'level is not an integer', 'unsuccessful regex validation')
    })
    createProgram(__filename, {}, [],  {
    }, cadence(function (async, program) {
        assert(program.format('ordered', 'this', 'that'), 'First that then this.', 'ordered format')
        assert(program.format('unordered', 'this', 'that'), 'First this then that.', 'unordered format')
    }), null, function (error) {
        if (error) throw error
    })
    createProgram(__filename, {}, [], io = {
        events: new events.EventEmitter
    }, cadence(function (async, program) {
        var first = async(), second = async(), third = async(), fourth = async()
        program.once('SIGINT', function () { first() })
        program.once('SIGINT', function () { second() })
        program.once('shutdown', function () { third() })
        program.once('shutdown', function () { fourth() })
    }), null, function (error) {
        if (error) throw error
        assert(true, 'signal handler')
    })
    io.events.emit('SIGINT')
}
