require('proof')(39, require('cadence')(prove))

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

function prove (async, assert) {
    var stream = require('stream'),
        events = require('events'),
        path = require('path'),
        cadence = require('cadence')
    var usage = 'usage: basic [options] [files]\n' +
                '    -c, --config <key=value>\n' +
                '        --longonly\n' +
                ''
    var createProgram = require('../program.js'), io
    createProgram(path.join(__dirname, 'endless.js'), {}, [], {}, cadence(function (async, program) {
    }), function (error, code) {
        assert(error.message, 'no usage found', 'no usage found')
    })
    createProgram(__filename, {}, [], io = {
        events: { exitCode: 0 }
    }, cadence(function (async, program) {
        assert(program.exitCode, 0, 'exit code get')
        program.exitCode = 1
        assert(program.exitCode, 1, 'exit code set')
    }), function (error) {
        if (error) throw error
        assert(io.events.exitCode, 1, 'exit non-zero')
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
        assert(error.stderr, 'A bad thing happened.', 'error')
        assert(error.code, 1, 'error code')
    })
    createProgram(__filename, {}, [], io = {
    }, cadence(function (async, program) {
        program.abend()
    }), function (error) {
        assert(!error.stderr, 'messageless error')
        assert(error.code, 1, 'messageless error code')
    })
    createProgram(__filename, {}, [], io = {
        stderr: new stream.PassThrough
    }, cadence(function (async, program) {
        program.abend(127, 'badness')
    }), function (error, code) {
        assert(error.stderr, 'A bad thing happened.', 'error with code')
        assert(error.code, 127, 'code for error with code')
    })
    createProgram(__filename, {}, [], io = {
        stderr: new stream.PassThrough
    }, cadence(function (async, program) {
        program.assert(true, 'badness')
        program.assert(false, 'badness')
    }), function (error, code) {
        assert(error.stderr, 'A bad thing happened.', 'failed assertion')
    })
    createProgram(__filename, {}, [], io = {
        stderr: new stream.PassThrough
    }, cadence(function (async, program) {
        program.abend('nogoodness')
    }), function (error, code) {
        assert(error.stderr, 'nogoodness', 'error string missing')
        assert(error.code, 1, 'error string missing code')
    })
    createProgram(__filename, {}, [ '-x' ], io = {
        stderr: new stream.PassThrough
    }, cadence(function (async, program) {
        program.abend('nogoodness')
        return 0
    }), function (error, code) {
        assert(error.stderr, 'unknown argument', 'unknown argument')
        assert(error.code, 1, 'unknown argument code')
    })
    createProgram(__filename, {}, [], io = {
    }, cadence(function (async, program) {
        program.exit(0)
        return 0
    }), function (error, code) {
        assert(error.code, 0, 'normal exit')
    })
    createProgram(__filename, {}, [], {}, cadence(function (async, program) {
        program.help()
    }), function (error) {
        assert(error.stdout + '\n', usage, 'help')
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
        assert(error.stderr, 'command required', 'command missing')
    })
    createProgram(path.join(__dirname, 'sub.js'), {}, [ 'run', '-p', 3, 'x' ],  {
    }, cadence(function (async, program) {
        assert(program.command.command.name, 'run', 'sub command name')
        assert(program.command.command.param.processes, 3, 'sub command name')
        return 0
    }), function (error, code) {
        if (error) throw error
        assert(code, 0, 'sub command normal exit')
    })
    createProgram(path.join(__dirname, 'sub.js'), {}, [
        'run', 'found'
    ], {}, cadence(function (async, program) {
        program.delegate('delegated', async())
    }), function (error, code) {
        if (error) throw error
        assert(code, 0, 'delegated command normal exit')
    })
    createProgram(path.join(__dirname, 'sub.js'), {}, [
        'run', 'unfound'
    ], {}, cadence(function (async, program) {
        program.delegate('delegated', async())
    }), function (error, code) {
        assert(error.stderr, 'cannot find executable command', 'delgated not found')
    })
    createProgram(path.join(__dirname, 'sub.js'), {}, [
        'run', 'broken'
    ], {}, cadence(function (async, program) {
        program.delegate('delegated', async())
    }), function (error, code) {
        assert(error.message, 'x is not defined', 'delgated program broken')
    })
    createProgram(path.join(__dirname, 'sub.js'), {}, [ 'run', '-l', 3 ],  {
    }, cadence(function (async, program) {
        program.command.command.required('level', 'processes')
    }), function (error) {
        assert(error.stderr, 'processes is required', 'required')
    })
    createProgram(path.join(__dirname, 'sub.js'), {}, [ 'run', '-p', 3, '-l', 'x' ],  {
    }, cadence(function (async, program) {
        program.command.command.validate('%s is not an integer', 'processes', /^\d+$/)
        program.command.command.validate('%s is not copacetic', 'level', function () { return true })
        program.command.command.validate('%s is not an integer', 'other', 'level', /^\d+$/)
    }), function (error) {
        assert(error.stderr, 'level is not an integer', 'validate')
    })
    createProgram(path.join(__dirname, 'sub.js'), {}, [ 'run', '-p', 3, '-l', 'x' ],  {
    }, cadence(function (async, program) {
        program.command.command.numeric('processes', 'level')
    }), function (error) {
        assert(error.stderr, 'level is not numeric', 'numeric')
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
        var on = async(), once = async()
        program.on('SIGINT', function () { on() })
        program.once('SIGINT', function () { once() })
    }), function (error, code) {
        if (error) throw error
        assert(true, 'signal handler')
    })
    io.events.emit('SIGINT')
    createProgram(path.join(__dirname, 'sub.js'), {}, [ 'run', '-b', 'FRED' ],  {
    }, cadence(function (async, program) {
        program.command.command.bind('bind')
    }), function (error) {
        assert(error.stderr, 'bind is not bindable', 'bind port')
    })
    createProgram(path.join(__dirname, 'sub.js'), {}, [ 'run', '-b', '0.0.1:8888' ],  {
    }, cadence(function (async, program) {
        program.command.command.bind('bind')
    }), function (error) {
        assert(error.stderr, 'bind is not bindable', 'bind address not enough parts')
    })
    createProgram(path.join(__dirname, 'sub.js'), {}, [ 'run', '-b', 'x.0.0.1:8888' ],  {
    }, cadence(function (async, program) {
        program.command.command.bind('bind')
    }), function (error) {
        assert(error.stderr, 'bind is not bindable', 'bind address not numeric')
    })
    createProgram(path.join(__dirname, 'sub.js'), {}, [ 'run', '-b', '8888' ],  {
    }, cadence(function (async, program) {
// TODO Throw an exception here and try to figure out how it becomes uncaught in
// a fully assembled arguable.
        var bind = program.command.command.bind('bind')
        assert(bind, { address: '0.0.0.0', port: 8888 }, 'bind all interfaces')
    }), function (e) {
    })
    createProgram(path.join(__dirname, 'sub.js'), {}, [ 'run', '-b', '127.0.0.1:8888' ],  {
    }, cadence(function (async, program) {
// TODO Throw an exception here and try to figure out how it becomes uncaught in
// a fully assembled arguable.
        var bind = program.command.command.bind('bind')
        assert(bind, { address: '127.0.0.1', port: 8888 }, 'bind specific interface')
    }), function (e) {
    })
}
