require('proof')(40, require('cadence')(prove))

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
    var Arguable = require('../arguable.js'), io

    var createArguable = cadence(function (async, source, env, argv, options, main, module) {
        var arguable = new Arguable(source, argv, options)
        main(arguable, async())
    })

    createArguable(path.join(__dirname, 'endless.js'), {}, [], {}, cadence(function (async, arguable) {
        okay(arguable.arguable, [], 'missing')
    }), null, function (error) {
        if (error) throw error
    })
    createArguable(__filename, {}, [], { lang: 'fr_FR' }, cadence(function (async, arguable) {
        okay(arguable.lang, 'fr_FR', 'override language')
    }), null, function (error) {
        if (error) throw error
    })
    createArguable(__filename, {}, [ '--' ], {}, cadence(function (async, arguable) {
        okay(arguable.terminal, 'terminal')
    }), null, function (error) {
        if (error) throw error
    })
    createArguable(__filename, {}, [ '--longonly' ], {}, cadence(function (async, arguable) {
        okay(arguable.ultimate.longonly, 'longonly')
        okay(arguable.arrayed.longonly, [ true ], 'longonly arrayed')
    }), null, function (error) {
        if (error) throw error
    })
    createArguable(__filename, {}, [ '-cone=1', '-c', 'two=2' ], {
    }, cadence(function (async, arguable) {
        okay(arguable.given, [ 'config' ], 'given')
        okay(arguable.arrayed, {
            config: [ 'one=1', 'two=2' ],
            level: [],
            processes: [ ],
            bind: []
        }, 'arrayed')
        okay(arguable.ultimate, { config: 'two=2' }, 'ultimate')
        okay(!arguable.terminal, 'not terminal')
    }), null, function (error) {
        if (error) throw error
    })
    createArguable(__filename, {}, [], {}, cadence(function (async, arguable) {
        throw new Error('raw')
    }), null, function (error) {
        okay(error.message, 'raw', 'raw exception')
    })
    createArguable(__filename, {}, [], io = {
        stderr: new stream.PassThrough
    }, cadence(function (async, arguable) {
        arguable.abend('badness')
    }), null, function (error) {
        okay(/^bigeasy.arguable#abend$/m.test(error.message), 'official message')
        okay(error.stderr, 'A bad thing happened.', 'error')
        okay(error.exitCode, 1, 'error code')
    })
    createArguable(__filename, {}, [], io = {
    }, cadence(function (async, arguable) {
        arguable.abend()
    }), null, function (error) {
        okay(!error.stderr, 'messageless error')
        okay(error.exitCode, 1, 'messageless error code')
    })
    createArguable(__filename, {}, [], io = {
        stderr: new stream.PassThrough
    }, cadence(function (async, arguable) {
        arguable.abend(127, 'badness')
    }), null, function (error) {
        okay(error.stderr, 'A bad thing happened.', 'error with code')
        okay(error.exitCode, 127, 'code for error with code')
    })
    createArguable(__filename, {}, [], io = {
        stderr: new stream.PassThrough
    }, cadence(function (async, arguable) {
        arguable.assert(true, 'badness')
        arguable.assert(false, 'badness')
    }), null, function (error) {
        okay(error.stderr, 'A bad thing happened.', 'failed assertion')
    })
    createArguable(__filename, {}, [], io = {
        stderr: new stream.PassThrough
    }, cadence(function (async, arguable) {
        arguable.abend('nogoodness')
    }), null, function (error) {
        okay(error.stderr, 'nogoodness', 'error string missing')
        okay(error.exitCode, 1, 'error string missing code')
    })
    createArguable(__filename, {}, [ '-x' ], io = {
        stderr: new stream.PassThrough
    }, cadence(function (async, arguable) {
        arguable.abend('nogoodness')
        return 0
    }), null, function (error) {
        okay(error.stderr, 'unknown argument', 'unknown argument')
        okay(error.exitCode, 1, 'unknown argument code')
    })
    createArguable(__filename, {}, [], {}, cadence(function (async, arguable) {
        arguable.help()
    }), null, function (error) {
        okay(error.stdout + '\n', usage, 'help')
    })
    createArguable(__filename, {}, [], {}, cadence(function (async, arguable) {
        arguable.helpIf(true)
    }), null, function (error) {
        okay(error.method, 'help', 'help if')
    })
    createArguable(__filename, {}, [], {}, cadence(function (async, arguable) {
        arguable.helpIf(false)
    }), null, function (error) {
        okay(!error, 'help if not')
    })
    createArguable(__filename, {}, [], {}, cadence(function (async, arguable) {
        okay(arguable.delegate(require, './fixtures/%s', 'delegate') != null, 'got delegate')
    }), module, function (error, child) {
        if (error) throw error
    })
    createArguable(__filename, {}, [], {}, cadence(function (async, arguable) {
        arguable.delegate(require, './fixtures/%s', 'missing')
    }), module, function (error) {
        console.log(error.stack)
        okay(error.stderr, 'sub command module not found', 'delegated not found')
    })
    createArguable(__filename, {}, [], {}, cadence(function (async, arguable) {
        arguable.delegate(require, './fixtures/%s', 'broken')
    }), module, function (error) {
        okay(error.message, 'broken', 'delegate broken')
    })
    createArguable(__filename, {}, [ '-l', 3 ],  {
    }, cadence(function (async, arguable) {
        arguable.required('level', 'processes')
    }), null, function (error) {
        okay(error.stderr, 'processes is required', 'required')
    })
    createArguable(__filename, {}, [ '-l', 'x', '-p', '3' ],  {
    }, cadence(function (async, arguable) {
        arguable.validate('%s is not an integer', 'processes', /^\d+$/)
        okay(arguable.ultimate.processes, '3', 'successful function validation')
    }), null, function (error) {
        if (error) throw error
    })
    createArguable(__filename, {}, [],  {
    }, cadence(function (async, arguable) {
        okay(arguable.attempt(function () { return 1 }, 'attempt'), 1, 'attempted')
        okay(arguable.attempt(function () { throw new Error }, 'failed attempt'), 1, 'attempted')
    }), null, function (error) {
        okay(error.stderr, 'failed attempt', 'failed attempt')
    })
    createArguable(__filename, {}, [],  {
    }, cadence(function (async, arguable) {
        okay(arguable.attempt(function () {
            throw new Error('failed attempt')
        }, /^failed attempt$/, 'failed attempt'), 1, 'attempted')
    }), null, function (error) {
        okay(error.stderr, 'failed attempt', 'failed attempt matched')
    })
    createArguable(__filename, {}, [ '-l', 'x' ],  {
    }, cadence(function (async, arguable) {
        arguable.validate('%s is not copacetic', 'level', function (value) {
            return 'x' == value
        })
        okay(arguable.ultimate.level, 'x', 'successful function validation')
    }), null, function (error) {
        if (error) throw error
    })
    createArguable(__filename, {}, [ '-l', 'x' ],  {
    }, cadence(function (async, arguable) {
        arguable.validate(function () { return 'y' }, 'level')
        okay(arguable.ultimate.level, 'y', 'validator as first argument')
    }), null, function (error) {
        if (error) throw error
    })
    createArguable(__filename, {}, [ '-l', 'x' ],  {
    }, cadence(function (async, arguable) {
        arguable.validate('level', function () { return 'y' })
        okay(arguable.ultimate.level, 'y', 'validator as last argument')
    }), null, function (error) {
        if (error) throw error
    })
    createArguable(__filename, {}, [ '-l', 'x' ],  {
    }, cadence(function (async, arguable) {
        arguable.validate('level', function () { throw new Error('thrown') })
    }), null, function (error) {
        okay(error.message, 'thrown', 'rethrow actual error')
    })
    createArguable(__filename, {}, [ '-l', 'x' ],  {
    }, cadence(function (async, arguable) {
        arguable.validate('%s is not an integer', 'other', 'level', /^\d+$/)
    }), null, function (error) {
        okay(error.stderr, 'level is not an integer', 'unsuccessful regex validation')
    })
    createArguable(__filename, {}, [],  {
    }, cadence(function (async, arguable) {
        okay(arguable.format('ordered', 'this', 'that'), 'First that then this.', 'ordered format')
        okay(arguable.format('unordered', 'this', 'that'), 'First this then that.', 'unordered format')
    }), null, function (error) {
        if (error) throw error
    })
}
