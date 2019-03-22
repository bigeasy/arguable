require('proof')(41, require('cadence')(prove))

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

function prove (async, okay) {
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
    var Program = require('../arguable.js'), io

    var createProgram = cadence(function (async, source, env, argv, options, main, module) {
        options.env = env
        options.module = module
        options.attributes || (options.attributes = [])
        var program = new Program(source, argv, options)
        main(program, async())
    })

    createProgram(path.join(__dirname, 'endless.js'), {}, [], {}, cadence(function (async, program) {
        okay(program.arguable, [], 'missing')
    }), null, function (error) {
        if (error) throw error
    })
    createProgram(__filename, { LANG: 'fr_FR' }, [], {}, cadence(function (async, program) {
        okay(program.lang, 'fr_FR', 'language from environment')
    }), null, function (error) {
        if (error) throw error
    })
    createProgram(__filename, {}, [ '--' ], {}, cadence(function (async, program) {
        okay(program.terminal, 'terminal')
    }), null, function (error) {
        if (error) throw error
    })
    createProgram(__filename, {}, [ '--longonly' ], {}, cadence(function (async, program) {
        okay(program.ultimate.longonly, 'longonly')
        okay(program.arrayed.longonly, [ true ], 'longonly arrayed')
    }), null, function (error) {
        if (error) throw error
    })
    createProgram(__filename, {}, [ '-cone=1', '-c', 'two=2' ], {
    }, cadence(function (async, program) {
        okay(program.given, [ 'config' ], 'given')
        okay(program.arrayed, {
            config: [ 'one=1', 'two=2' ],
            level: [],
            processes: [ ],
            bind: []
        }, 'arrayed')
        okay(program.ultimate, { config: 'two=2' }, 'ultimate')
        okay(!program.terminal, 'not terminal')
    }), null, function (error) {
        if (error) throw error
    })
    createProgram(__filename, {}, [], {}, cadence(function (async, program) {
        throw new Error('raw')
    }), null, function (error) {
        okay(error.message, 'raw', 'raw exception')
    })
    createProgram(__filename, {}, [], io = {
        stderr: new stream.PassThrough
    }, cadence(function (async, program) {
        program.abend('badness')
    }), null, function (error) {
        okay(/^bigeasy.arguable#abend$/m.test(error.message), 'official message')
        okay(error.stderr, 'A bad thing happened.', 'error')
        okay(error.exitCode, 1, 'error code')
    })
    createProgram(__filename, {}, [], io = {
    }, cadence(function (async, program) {
        program.abend()
    }), null, function (error) {
        okay(!error.stderr, 'messageless error')
        okay(error.exitCode, 1, 'messageless error code')
    })
    createProgram(__filename, {}, [], io = {
        stderr: new stream.PassThrough
    }, cadence(function (async, program) {
        program.abend(127, 'badness')
    }), null, function (error) {
        okay(error.stderr, 'A bad thing happened.', 'error with code')
        okay(error.exitCode, 127, 'code for error with code')
    })
    createProgram(__filename, {}, [], io = {
        stderr: new stream.PassThrough
    }, cadence(function (async, program) {
        program.assert(true, 'badness')
        program.assert(false, 'badness')
    }), null, function (error) {
        okay(error.stderr, 'A bad thing happened.', 'failed assertion')
    })
    createProgram(__filename, {}, [], io = {
        stderr: new stream.PassThrough
    }, cadence(function (async, program) {
        program.abend('nogoodness')
    }), null, function (error) {
        okay(error.stderr, 'nogoodness', 'error string missing')
        okay(error.exitCode, 1, 'error string missing code')
    })
    createProgram(__filename, {}, [ '-x' ], io = {
        stderr: new stream.PassThrough
    }, cadence(function (async, program) {
        program.abend('nogoodness')
        return 0
    }), null, function (error) {
        okay(error.stderr, 'unknown argument', 'unknown argument')
        okay(error.exitCode, 1, 'unknown argument code')
    })
    createProgram(__filename, {}, [], {}, cadence(function (async, program) {
        program.help()
    }), null, function (error) {
        okay(error.stdout + '\n', usage, 'help')
    })
    createProgram(__filename, {}, [], {}, cadence(function (async, program) {
        program.helpIf(true)
    }), null, function (error) {
        okay(error.method, 'help', 'help if')
    })
    createProgram(__filename, {}, [], {}, cadence(function (async, program) {
        program.helpIf(false)
    }), null, function (error) {
        okay(!error, 'help if not')
    })
    createProgram(__filename, {}, [], {}, cadence(function (async, program) {
        var pkg = path.resolve(__dirname, './fixtures/delegate')
        program.delegate(pkg, [], async())
    }), module, function (error, child) {
        if (error) throw error
        okay(child, 'delegated command normal exit')
    })
    createProgram(__filename, {}, [
        'unfound'
    ], {}, cadence(function (async, program) {
        program.delegate(path.resolve(__dirname, './fixtures/missing'), [], async())
    }), module, function (error) {
        okay(error.stderr, 'sub command module not found', 'delegated not found')
    })
    createProgram(__filename, {}, [
        'broken'
    ], {}, cadence(function (async, program) {
        program.delegate(path.resolve(__dirname, './fixtures/broken'), async())
    }), module, function (error) {
        okay(error.message, 'x is not defined', 'delgated program broken')
    })
    createProgram(__filename, {}, [ '-l', 3 ],  {
    }, cadence(function (async, program) {
        program.required('level', 'processes')
    }), null, function (error) {
        okay(error.stderr, 'processes is required', 'required')
    })
    createProgram(__filename, {}, [ '-l', 'x', '-p', '3' ],  {
    }, cadence(function (async, program) {
        program.validate('%s is not an integer', 'processes', /^\d+$/)
        okay(program.ultimate.processes, '3', 'successful function validation')
    }), null, function (error) {
        if (error) throw error
    })
    createProgram(__filename, {}, [],  {
    }, cadence(function (async, program) {
        okay(program.attempt(function () { return 1 }, 'attempt'), 1, 'attempted')
        okay(program.attempt(function () { throw new Error }, 'failed attempt'), 1, 'attempted')
    }), null, function (error) {
        okay(error.stderr, 'failed attempt', 'failed attempt')
    })
    createProgram(__filename, {}, [],  {
    }, cadence(function (async, program) {
        okay(program.attempt(function () {
            throw new Error('failed attempt')
        }, /^failed attempt$/, 'failed attempt'), 1, 'attempted')
    }), null, function (error) {
        okay(error.stderr, 'failed attempt', 'failed attempt matched')
    })
    createProgram(__filename, {}, [ '-l', 'x' ],  {
    }, cadence(function (async, program) {
        program.validate('%s is not copacetic', 'level', function (value) {
            return 'x' == value
        })
        okay(program.ultimate.level, 'x', 'successful function validation')
    }), null, function (error) {
        if (error) throw error
    })
    createProgram(__filename, {}, [ '-l', 'x' ],  {
    }, cadence(function (async, program) {
        program.validate(function () { return 'y' }, 'level')
        okay(program.ultimate.level, 'y', 'validator as first argument')
    }), null, function (error) {
        if (error) throw error
    })
    createProgram(__filename, {}, [ '-l', 'x' ],  {
    }, cadence(function (async, program) {
        program.validate('level', function () { return 'y' })
        okay(program.ultimate.level, 'y', 'validator as last argument')
    }), null, function (error) {
        if (error) throw error
    })
    createProgram(__filename, {}, [ '-l', 'x' ],  {
    }, cadence(function (async, program) {
        program.validate('level', function () { throw new Error('thrown') })
    }), null, function (error) {
        okay(error.message, 'thrown', 'rethrow actual error')
    })
    createProgram(__filename, {}, [ '-l', 'x' ],  {
    }, cadence(function (async, program) {
        program.validate('%s is not an integer', 'other', 'level', /^\d+$/)
    }), null, function (error) {
        okay(error.stderr, 'level is not an integer', 'unsuccessful regex validation')
    })
    createProgram(__filename, {}, [],  {
    }, cadence(function (async, program) {
        okay(program.format('ordered', 'this', 'that'), 'First that then this.', 'ordered format')
        okay(program.format('unordered', 'this', 'that'), 'First this then that.', 'unordered format')
    }), null, function (error) {
        if (error) throw error
    })
    createProgram(__filename, {
    }, [],  {
        attributes: [{ extension: 1 }]
    }, cadence(function (async, program) {
        okay(program.attributes.extension, 1, 'additional attributes')
    }), null, function (error) {
        if (error) throw error
    })
}
