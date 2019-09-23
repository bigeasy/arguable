describe('getopt', () => {
    const assert = require('assert')
    const pattern = [
        { terse: 'a', verbose: 'ambiguous' },
        { terse: 'A', verbose: 'arbitrary' },
        { terse: 't', verbose: 'toggle' },
        { terse: 'N', verbose: 'name', valuable: true },
        { terse: 'p', verbose: 'processes', valuable: true },
        { terse: 'c', verbose: 'config', valuable: true },
        { verbose: 'help', arguable: false }
    ]
    const getopt = require('../getopt')
    it('can parse a terse string', () => {
        const params = getopt(pattern, [ '-N', 'steve'])
        assert.deepStrictEqual(params, [{ name: 'name', value: 'steve' }], 'terse string')
    })
    it('can parse a terse mushed string', () => {
        const params = getopt(pattern, [ '-Nsteve'])
        assert.deepStrictEqual(params, [{ name: 'name', value: 'steve' }], 'terse mushed string')
    })
    it('can parse a verbose string', () => {
        const params = getopt(pattern, [ '--name', 'steve'])
        assert.deepStrictEqual(params, [{ name: 'name', value: 'steve' }], 'verbose string')
    })
    it('can parse a verbose abbrevated string', () => {
        const params = getopt(pattern, [ '--n', 'steve'])
        assert.deepStrictEqual(params, [{ name: 'name', value: 'steve' }], 'verbose abbrevated string')
    })
    it('can parse a verbose assigned string', () => {
        const params = getopt(pattern, [ '--name=steve'])
        assert.deepStrictEqual(params, [{ name: 'name', value: 'steve' }], 'verbose assigned string')
    })
    it('can parse booleans', () => {
        const params = getopt(pattern, [ '--t' ])
        assert.deepStrictEqual(params, [{ name: 'toggle', value: true }], 'booleans')
    })
    it('can negate booleans', () => {
        const params = getopt(pattern, [ '--no-t' ])
        assert.deepStrictEqual(params, [{ name: 'toggle', value: false }], 'negations')
    })
    it('can negate booleans', () => {
        const params = getopt(pattern, [ '--no-t' ])
        assert.deepStrictEqual(params, [{ name: 'toggle', value: false }], 'negations')
    })
    // Put ambiguous here...
    it('can parse catenated short opt without argument', () => {
        try {
            getopt(pattern, [ '--no-name' ])
            assert(false, 'did not raise an exception')
        } catch (error) {
            assert.deepStrictEqual(error, {
                abend: 'argument not negatable',
                context: '--no-name'
            }, 'error')
        }
    })
    it('can create an array of matches', () => {
        const params = getopt(pattern, [ '-c', 'one=1', '--config=two=2', '--config', 'three=3' ])
        assert.deepStrictEqual(params, [{
            name: 'config', value: 'one=1'
        }, {
            name: 'config', value: 'two=2'
        }, {
            name: 'config', value: 'three=3'
        }], 'array')
    })
    it('can stop at a double-hyphen terminator', () => {
        const argv = [ '-p', '3', '--', '-A' ]
        const params = getopt(pattern, argv)
        assert.deepStrictEqual(argv, [ '--', '-A' ], 'stop on double hyphens')
        assert.deepStrictEqual(params, [{ name: 'processes', value: '3' }], 'stop on double hyphens params')
    })
    it('can preserve the order of arguments', () => {
        const argv = [ '-a', '-p', '3', '-a' ]
        assert.deepStrictEqual(getopt(pattern, argv), [
            { name: 'ambiguous', value: true },
            { name: 'processes', value: '3' },
            { name: 'ambiguous', value: true }
        ], 'ordered')
    })
    it('can detect an unknown argument', () => {
        try {
            getopt(pattern, [ '-ax' ])
        } catch (error) {
            assert.deepStrictEqual(error, {
                abend: 'unknown argument',
                context: '-x'
            }, 'unknown')
            return
        }
        throw new Error
    })
    it('can detect a missing terse argument value', () => {
        try {
            getopt(pattern, [ '-c' ])
        } catch (error) {
            assert.deepStrictEqual(error, {
                abend: 'missing argument',
                context: '-c'
            }, 'unknown')
            return
        }
        throw new Error
    })
    it('can detect a missing verbose argument value', () => {
        try {
            getopt(pattern, [ '--c' ])
        } catch (error) {
            assert.deepStrictEqual(error, {
                abend: 'missing argument',
                context: '--config'
            }, 'unknown')
            return
        }
        throw new Error
    })
    it('can report an ambiguous verbose argument', () => {
        try {
            getopt(pattern, [ '--a' ])
        } catch (error) {
            assert.deepStrictEqual(error, {
                abend: 'ambiguous argument',
                context: '--a'
            }, 'unknown')
            return
        }
        throw new Error
    })
    it('can report an unexpected argument value', () => {
        try {
            getopt(pattern, [ '--ambiguous=1' ])
        } catch (error) {
            assert.deepStrictEqual(error, {
                abend: 'unexpected argument value',
                context: '--ambiguous'
            }, 'unknown')
            return
        }
        throw new Error
    })
})
