require('proof')(17, (okay) => {
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
    {
        const params = getopt(pattern, [ '-N', 'steve'])
        okay(params, [{ name: 'name', value: 'steve' }], 'terse string')
    }
    {
        const params = getopt(pattern, [ '-Nsteve'])
        okay(params, [{ name: 'name', value: 'steve' }], 'terse mushed string')
    }
    {
        const params = getopt(pattern, [ '--name', 'steve'])
        okay(params, [{ name: 'name', value: 'steve' }], 'verbose string')
    }
    {
        const params = getopt(pattern, [ '--n', 'steve'])
        okay(params, [{ name: 'name', value: 'steve' }], 'verbose abbrevated string')
    }
    {
        const params = getopt(pattern, [ '--name=steve'])
        okay(params, [{ name: 'name', value: 'steve' }], 'verbose assigned string')
    }
    {
        const params = getopt(pattern, [ '--t' ])
        okay(params, [{ name: 'toggle', value: true }], 'booleans')
    }
    {
        const params = getopt(pattern, [ '--no-t' ])
        okay(params, [{ name: 'toggle', value: false }], 'negations')
    }
    // Put ambiguous here...
    {
        try {
            getopt(pattern, [ '--no-name' ])
            throw new Error
        } catch (error) {
            okay(error, {
                abend: 'argument not negatable',
                context: '--no-name'
            }, 'parse catenated short opt without argument')
        }
    }
    {
        const params = getopt(pattern, [ '-c', 'one=1', '--config=two=2', '--config', 'three=3' ])
        okay(params, [{
            name: 'config', value: 'one=1'
        }, {
            name: 'config', value: 'two=2'
        }, {
            name: 'config', value: 'three=3'
        }], 'create an array of matches')
    }
    {
        const argv = [ '-p', '3', '--', '-A' ]
        const params = getopt(pattern, argv)
        okay(argv, [ '--', '-A' ], 'stop on double hyphens')
        okay(params, [{ name: 'processes', value: '3' }], 'stop on double hyphens params')
    }
    {
        const argv = [ '-a', '-p', '3', '-a' ]
        okay(getopt(pattern, argv), [
            { name: 'ambiguous', value: true },
            { name: 'processes', value: '3' },
            { name: 'ambiguous', value: true }
        ], 'preserve order of arguments')
    }
    {
        try {
            getopt(pattern, [ '-ax' ])
            throw new Error
        } catch (error) {
            okay(error, {
                abend: 'unknown argument',
                context: '-x'
            }, 'unknown argument')
        }
    }
    {
        try {
            getopt(pattern, [ '-c' ])
            throw new Error
        } catch (error) {
            okay(error, {
                abend: 'missing argument',
                context: '-c'
            }, 'missing terse value')
        }
    }
    {
        try {
            getopt(pattern, [ '--c' ])
            throw new Error
        } catch (error) {
            okay(error, {
                abend: 'missing argument',
                context: '--config'
            }, 'missing verbose argument value')
        }
    }
    {
        try {
            getopt(pattern, [ '--a' ])
            throw new Error
        } catch (error) {
            okay(error, {
                abend: 'ambiguous argument',
                context: '--a'
            }, 'report an ambiguous verbose argument')
        }
    }
    {
        try {
            getopt(pattern, [ '--ambiguous=1' ])
            throw new Error
        } catch (error) {
            okay(error, {
                abend: 'unexpected argument value',
                context: '--ambiguous'
            }, 'unexpected argument value')
        }
    }
})
