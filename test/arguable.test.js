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
describe('arguable', () => {
    const assert = require('assert')
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
    it('can survive a usage with no terminator', () => {
        const source = path.join(__dirname, 'endless.js')
        const arguable = new Arguable(Usage(source), [], {})
        assert.deepStrictEqual(arguable.valuable, [], 'missing')
    })
    it('can override the default source language', () => {
        const arguable = new Arguable(Usage(__filename), [], { lang: 'fr_FR' })
        assert.equal(arguable.lang, 'fr_FR', 'override language')
    })
    it('can detect and report a named argument terminator', () => {
        const arguable = new Arguable(Usage(__filename), [ '--' ], {})
        assert(arguable.terminator, 'terminator')
    })
    it('can parse an argument that is long name only', () => {
        const arguable = new Arguable(Usage(__filename), [ '--longonly' ], {})
        assert.deepStrictEqual(arguable.given, [ 'longonly' ], 'given')
        assert(arguable.ultimate.longonly, 'longonly')
        assert.deepStrictEqual(arguable.arrayed.longonly, [ true ], 'longonly arrayed')
    })
    it('can parse a short argument with values', () => {
        const arguable = new Arguable(Usage(__filename), [ '-cone=1', '-c', 'two=2' ], {})
        assert.deepStrictEqual(arguable.given, [ 'config' ], 'given')
        assert.deepStrictEqual(arguable.arrayed, {
            config: [ 'one=1', 'two=2' ],
            bind: [],
            level: [],
            processes: []
        }, 'config arrayed')
        assert.deepStrictEqual(arguable.ultimate, { config: 'two=2' }, 'config ultimate')
        assert(!arguable.terminator, 'no terminator')
    })
    it('can raise a formatted error exit message', () => {
        const arguable = new Arguable(Usage(__filename), [], {})
        try {
            arguable.abend('badness')
        } catch (error) {
            assert(error instanceof Arguable.Error, 'is arguable error')
            assert.equal(/^(.*)\n/.exec(error.message)[1], 'abend', 'abend message')
            assert.equal(error.method, 'abend', 'is abend')
            assert.equal(error.stderr, 'A bad thing happened.', 'error')
            assert.equal(error.exitCode, 1, 'exit code')
            return
        }
        throw new Error
    })
    it('can raise a messageless error exit message', () => {
        const arguable = new Arguable(Usage(__filename), [], {})
        try {
            arguable.abend()
        } catch (error) {
            assert(error instanceof Arguable.Error, 'is arguable error')
            assert.equal(/^(.*)\n/.exec(error.message)[1], 'abend', 'abend message')
            assert.equal(error.method, 'abend', 'is abend')
            assert(error.stderr == null, 'messageless error')
            assert.equal(error.exitCode, 1, 'exit code')
            return
        }
        throw new Error
    })
    it('can raise a formatted error exit message with exit code', () => {
        const arguable = new Arguable(Usage(__filename), [], {})
        try {
            arguable.abend(127, 'badness')
        } catch (error) {
            assert(error instanceof Arguable.Error, 'is arguable error')
            assert.equal(/^(.*)\n/.exec(error.message)[1], 'abend', 'abend message')
            assert.equal(error.method, 'abend', 'is abend')
            assert.equal(error.stderr, 'A bad thing happened.', 'error')
            assert.equal(error.exitCode, 127, 'exit code')
            return
        }
        throw new Error
    })
    it('can raise an error exit from an assertion', () => {
        const arguable = new Arguable(Usage(__filename), [], {})
        arguable.assert(true, 'badness')
        try {
            arguable.assert(false, 'badness')
        } catch (error) {
            assert(error instanceof Arguable.Error, 'is arguable error')
            assert.equal(/^(.*)\n/.exec(error.message)[1], 'abend', 'is abend')
            assert.equal(error.stderr, 'A bad thing happened.', 'error')
            assert.equal(error.exitCode, 1, 'exit code')
            return
        }
        throw new Error
    })
    it('can raise an error exit with a missing error message', () => {
        const arguable = new Arguable(Usage(__filename), [], {})
        try {
            arguable.abend('nogoodness')
        } catch (error) {
            assert(error instanceof Arguable.Error, 'is arguable error')
            assert.equal(/^(.*)\n/.exec(error.message)[1], 'abend', 'abend message')
            assert.equal(error.method, 'abend', 'is abend')
            assert.equal(error.stderr, 'nogoodness', 'error')
            assert.equal(error.exitCode, 1, 'exit code')
            return
        }
        throw new Error
    })
    it('can raise an unknown argument error exit', () => {
        try {
            new Arguable(Usage(__filename), [ '-x' ], {})
        } catch (error) {
            assert(error instanceof Arguable.Error, 'is arguable error')
            assert.equal(/^(.*)\n/.exec(error.message)[1], 'abend', 'abend message')
            assert.equal(error.method, 'abend', 'is abend')
            assert.equal(error.stderr, 'unknown argument', 'error')
            assert.equal(error.exitCode, 1, 'exit code')
            return
        }
        throw new Error
    })
    it('can raise a help exit', () => {
        const arguable = new Arguable(Usage(__filename), [], {})
        try {
            arguable.help()
        } catch (error) {
            assert(error instanceof Arguable.Error, 'is arguable error')
            assert.equal(/^(.*)\n/.exec(error.message)[1], 'abend', 'is abend')
            assert.equal(error.method, 'help', 'is help')
            assert.equal(error.stdout + '\n', usage, 'help')
            assert.equal(error.exitCode, 0, 'exit code')
            return
        }
        throw new Error
    })
    it('can raise a help if exit', () => {
        const arguable = new Arguable(Usage(__filename), [], {})
        try {
            arguable.helpIf(true)
        } catch (error) {
            assert(error instanceof Arguable.Error, 'is arguable error')
            assert.equal(/^(.*)\n/.exec(error.message)[1], 'abend', 'is abend')
            assert.equal(error.method, 'help', 'is help')
            assert.equal(error.stdout + '\n', usage, 'help')
            assert.equal(error.exitCode, 0, 'exit code')
            return
        }
        throw new Error
    })
    it('will not raise a help if exit', () => {
        const arguable = new Arguable(Usage(__filename), [], {})
        arguable.helpIf(false)
    })
    it('can load a delegate module', () => {
        const arguable = new Arguable(Usage(__filename), [], {})
        assert(arguable.delegate(require, './fixtures/%s', 'delegate') != null, 'got delegate')
    })
    it('can report a missing delegate module', () => {
        const arguable = new Arguable(Usage(__filename), [], {})
        try {
            arguable.delegate(require, './fixtures/%s', 'missing')
        } catch (error) {
            assert.equal(error.stderr, 'sub command module not found', 'delegated not found')
            return
        }
        throw new Error
    })
    it('will propagate delegate module errors', () => {
        const arguable = new Arguable(Usage(__filename), [], {})
        try {
            arguable.delegate(require, './fixtures/%s', 'broken')
        } catch (error) {
            assert.equal(error.message, 'broken', 'delegate broken')
        }
    })
    it('can validate a required argument', () => {
        const arguable = new Arguable(Usage(__filename), [ '-l', 1 ], {})
        try {
            arguable.required('level', 'processes')
        } catch (error) {
            assert.equal(error.stderr, 'processes is required', 'required')
            return
        }
        throw new Error
    })
    it('can validate via a regex', () => {
        const arguable = new Arguable(Usage(__filename), [ '-p', 3 ], {})
        arguable.validate('%s is not an integer', 'processes', /^\d+$/)
        assert.equal(arguable.ultimate.processes, '3', 'successful function validation')
    })
    it('can fail validation via a regex', () => {
        const arguable = new Arguable(Usage(__filename), [ '-l', 'x' ], {})
        try {
            arguable.validate('%s is not an integer', 'other', 'level', /^\d+$/)
        } catch (error) {
            assert.equal(error.stderr, 'level is not an integer', 'unsuccessful regex validation')
            return
        }
        throw new Error
    })
    it('can validate via a function', () => {
        const arguable = new Arguable(Usage(__filename), [ '-l', 'x' ], {})
        arguable.validate('%s is not copacetic', 'level', (value) => 'x' == value)
        assert.equal(arguable.ultimate.level, 'x', 'successful function validation')
    })
    it('can validate with a validator as the first argument', () => {
        const arguable = new Arguable(Usage(__filename), [ '-l', 'x' ], {})
        arguable.validate(() => 'y', 'level')
        assert.equal(arguable.ultimate.level, 'y', 'validator as first argument')
    })
    it('can validate with a validator as the last argument', () => {
        const arguable = new Arguable(Usage(__filename), [ '-l', 'x' ], {})
        arguable.validate('level', () => 'y')
        assert.equal(arguable.ultimate.level, 'y', 'validator as last argument')
    })
    it('can propagate an exception thrown by a validator', () => {
        const arguable = new Arguable(Usage(__filename), [ '-l', 'x' ], {})
        try {
            arguable.validate('level', () => { throw new Error('thrown') })
        } catch (error) {
            assert.equal(error.message, 'thrown', 'rethrow actual error')
            return
        }
        throw new Error
    })
    // TODO Just use `sprintf`.
    it('can reorder arguments in a format', () => {
        const arguable = new Arguable(Usage(__filename), [ '-l', 'x' ], {})
        assert.equal(arguable.format('ordered', 'this', 'that'), 'First that then this.', 'ordered format')
        assert.equal(arguable.format('unordered', 'this', 'that'), 'First this then that.', 'unordered format')
    })
})
