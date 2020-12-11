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
require('proof')(35, (okay) => {
    const stream = require('stream')
    const events = require('events')
    const path = require('path')
    const usage = 'usage: basic [options] [files]\n' +
                  '    -c, --config <key=value>\n' +
                  '        --longonly\n' +
                  '    -l, --level <value>\n' +
                  '    -p, --processes <value>\n' +
                  '    -b, --bind <address>\n' +
                  ''
    const Usage = require('../usage')
    const Arguable = require('../arguable')
    {
        const source = path.join(__dirname, 'endless.js')
        const arguable = new Arguable(Usage(source), [], {})
        okay(arguable.valuable, [], 'usage with no terminator')
    }
    {
        const arguable = new Arguable(Usage(__filename), [], { lang: 'fr_FR' })
        okay(arguable.lang, 'fr_FR', 'override default source language')
    }
    {
        const arguable = new Arguable(Usage(__filename), [ '--' ], {})
        okay(arguable.terminator, 'detect and report a named argument terminator')
    }
    {
        const arguable = new Arguable(Usage(__filename), [ '--longonly' ], {})
        okay({
            given: arguable.given,
            ultimate: arguable.ultimate.longonly,
            arrayed: arguable.arrayed.longonly
        }, {
            given: [ 'longonly' ],
            ultimate: true,
            arrayed: [ true ]
        }, 'parse an argument that is long name only')
    }
    {
        const arguable = new Arguable(Usage(__filename), [ '-cone=1', '-c', 'two=2' ], {})
        okay(arguable.given, [ 'config' ], 'given')
        okay({
            terminator: arguable.terminator,
            ultimate: arguable.ultimate.config,
            arrayed: arguable.arrayed,
        }, {
            terminator: false,
            ultimate: 'two=2',
            arrayed: {
                config: [ 'one=1', 'two=2' ],
                bind: [],
                level: [],
                processes: []
            }
        }, 'short argument with values')
    }
    {
        const arguable = new Arguable(Usage(__filename), [], {})
        try {
            arguable.abend('badness')
            throw new Error
        } catch (error) {
            okay({
                isArguableError: error instanceof Arguable.Error,
                message: /^(.*)\n/.exec(error.message)[1],
                method: error.method,
                stderr: error.stderr,
                exitCode: error.exitCode
            }, {
                isArguableError: true,
                message: 'user initiated an early exit',
                method: 'abend',
                stderr: 'A bad thing happened.',
                exitCode: 1
            }, 'raise a formatted error exit message')
        }
    }
    {
        const arguable = new Arguable(Usage(__filename), [], {})
        try {
            arguable.abend()
            throw new Error
        } catch (error) {
            okay({
                isArguableError: error instanceof Arguable.Error,
                message: /^(.*)\n/.exec(error.message)[1],
                method: error.method,
                stderr: error.stderr,
                exitCode: error.exitCode
            }, {
                isArguableError: true,
                message: 'user initiated an early exit',
                method: 'abend',
                stderr: null,
                exitCode: 1
            }, 'raise a messageless error exit message')
        }
    }
    {
        const arguable = new Arguable(Usage(__filename), [], {})
        try {
            arguable.abend(127, 'badness')
            throw new Error
        } catch (error) {
            okay(error instanceof Arguable.Error, 'is arguable error')
            okay(/^(.*)\n/.exec(error.message)[1], 'user initiated an early exit', 'abend message')
            okay(error.method, 'abend', 'is abend')
            okay(error.stderr, 'A bad thing happened.', 'error')
            okay(error.exitCode, 127, 'exit code')
            okay({
                isArguableError: error instanceof Arguable.Error,
                message: /^(.*)\n/.exec(error.message)[1],
                method: error.method,
                stderr: error.stderr,
                exitCode: error.exitCode
            }, {
                isArguableError: true,
                message: 'user initiated an early exit',
                method: 'abend',
                stderr: 'A bad thing happened.',
                exitCode: 127
            }, 'raise a formatted error exit message with exit code')
        }
    }
    {
        const arguable = new Arguable(Usage(__filename), [], {})
        arguable.assert(true, 'badness')
        try {
            arguable.assert(false, 'badness')
            throw new Error
        } catch (error) {
            okay(error instanceof Arguable.Error, 'is arguable error')
            okay(/^(.*)\n/.exec(error.message)[1], 'user initiated an early exit', 'is abend')
            okay(error.stderr, 'A bad thing happened.', 'error')
            okay(error.exitCode, 1, 'exit code')
            okay({
                isArguableError: error instanceof Arguable.Error,
                message: /^(.*)\n/.exec(error.message)[1],
                method: error.method,
                stderr: error.stderr,
                exitCode: error.exitCode
            }, {
                isArguableError: true,
                message: 'user initiated an early exit',
                method: 'abend',
                stderr: 'A bad thing happened.',
                exitCode: 1
            }, 'raise an error exit from an assertion')
        }
    }
    {
        const arguable = new Arguable(Usage(__filename), [], {})
        try {
            arguable.abend('nogoodness')
            throw new Error
        } catch (error) {
            okay({
                isArguableError: error instanceof Arguable.Error,
                message: /^(.*)\n/.exec(error.message)[1],
                method: error.method,
                stderr: error.stderr,
                exitCode: error.exitCode
            }, {
                isArguableError: true,
                message: 'user initiated an early exit',
                method: 'abend',
                stderr: 'nogoodness',
                exitCode: 1
            }, 'raise an error exit with a missing error message')
        }
    }
    {
        try {
            new Arguable(Usage(__filename), [ '-x' ], {})
            throw new Error
        } catch (error) {
            okay({
                isArguableError: error instanceof Arguable.Error,
                message: /^(.*)\n/.exec(error.message)[1],
                method: error.method,
                stderr: error.stderr,
                exitCode: error.exitCode
            }, {
                isArguableError: true,
                message: 'user initiated an early exit',
                method: 'abend',
                stderr: 'unknown argument',
                exitCode: 1
            }, 'raise an unknown argument error exit')
        }
    }
    {
        try {
            new Arguable(Usage(__filename), [], {}).help()
            throw new Error
        } catch (error) {
            okay({
                isArguableError: error instanceof Arguable.Error,
                message: /^(.*)\n/.exec(error.message)[1],
                method: error.method,
                stdout: error.stdout + '\n',
                exitCode: error.exitCode
            }, {
                isArguableError: true,
                message: 'user initiated an early exit',
                method: 'help',
                stdout: usage,
                exitCode: 0
            }, 'raise help exit')
        }
    }
    {
        const argauble = new Arguable(Usage(__filename), [], {})
        try {
            argauble.helpIf(false)
            argauble.helpIf(true)
            throw new Error
        } catch (error) {
            okay({
                isArguableError: error instanceof Arguable.Error,
                message: /^(.*)\n/.exec(error.message)[1],
                method: error.method,
                stdout: error.stdout + '\n',
                exitCode: error.exitCode
            }, {
                isArguableError: true,
                message: 'user initiated an early exit',
                method: 'help',
                stdout: usage,
                exitCode: 0
            }, 'raise help if exit')
        }
    }
    {
        const arguable = new Arguable(Usage(__filename), [], {})
        okay(arguable.delegate(require, './fixtures/%s', 'delegate') != null, 'load delegate')
    }
    {
        const arguable = new Arguable(Usage(__filename), [], {})
        try {
            arguable.delegate(require, './fixtures/%s', 'missing')
            throw new Error
        } catch (error) {
            okay(error.stderr, 'sub command module not found', 'report missing delegate')
        }
    }
    {
        const arguable = new Arguable(Usage(__filename), [], {})
        try {
            arguable.delegate(require, './fixtures/%s', 'broken')
            throw new Error
        } catch (error) {
            okay(error.message, 'broken', 'propagate delegate module errors')
        }
    }
    {
        const arguable = new Arguable(Usage(__filename), [ '-l', 1 ], {})
        try {
            arguable.required('level', 'processes')
            throw new Error
        } catch (error) {
            okay(error.stderr, 'processes is required', 'validate a required argument')
        }
    }
    {
        const arguable = new Arguable(Usage(__filename), [ '-p', 3 ], {})
        arguable.validate('%s is not an integer', 'processes', /^\d+$/)
        okay(arguable.ultimate.processes, 3, 'validate via regex')
    }
    {
        const arguable = new Arguable(Usage(__filename), [ '-p', 1, '-l', 'x' ], {})
        try {
            arguable.validate('%s is not an integer', 'other', 'level', /^\d+$/)
            throw new Error
        } catch (error) {
            okay(error.stderr, 'level is not an integer', 'unsuccessful regex validation')
        }
    }
    {
        const arguable = new Arguable(Usage(__filename), [ '-l', 'x' ], {})
        arguable.validate('%s is not copacetic', 'level', (value) => 'x' == value)
        okay(arguable.ultimate.level, 'x', 'successful function validation')
    }
    {
        const arguable = new Arguable(Usage(__filename), [ '-l', 'x' ], {})
        arguable.validate(() => 'y', 'level')
        okay(arguable.ultimate.level, 'y', 'validator as first argument')
    }
    {
        const arguable = new Arguable(Usage(__filename), [ '-l', 'x' ], {})
        arguable.validate('level', () => 'y')
        okay(arguable.ultimate.level, 'y', 'validator as last argument')
    }
    {
        const arguable = new Arguable(Usage(__filename), [ '-l', 'x' ], {})
        try {
            arguable.validate('level', () => { throw new Error('thrown') })
            throw new Error
        } catch (error) {
            okay(error.message, 'thrown', 'rethrow error thrown by validator')
        }
    }
    // TODO Just use `sprintf`.
    {
        const arguable = new Arguable(Usage(__filename), [ '-l', 'x' ], {})
        okay(arguable.format('ordered', 'this', 'that'), 'First that then this.', 'ordered format')
        okay(arguable.format('unordered', 'this', 'that'), 'First this then that.', 'unordered format')
    }
})
