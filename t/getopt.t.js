require('proof/redux')(17, prove)

function prove (assert) {
    var pattern = [
        { terse: 'a', verbose: 'ambiguous' },
        { terse: 'A', verbose: 'arbitrary' },
        { terse: 'N', verbose: 'name', arguable: true },
        { terse: 'p', verbose: 'processes', arguable: true },
        { terse: 'c', verbose: 'config', arguable: true },
        { verbose: 'help', arguable: false }
    ]
    var getopt = require('../getopt'), params
    params = getopt(pattern, [ '-N', 'steve'])
    assert(params, [{ name: 'name', value: 'steve' }], 'terse string')
    params = getopt(pattern, [ '-Nsteve'])
    assert(params, [{ name: 'name', value: 'steve' }], 'terse mushed string')
    params = getopt(pattern, [ '--name', 'steve'])
    assert(params, [{ name: 'name', value: 'steve' }], 'verbose string')
    params = getopt(pattern, [ '--n', 'steve'])
    assert(params, [{ name: 'name', value: 'steve' }], 'verbose abbrevated string')
    params = getopt(pattern, [ '--name=steve'])
    assert(params, [{ name: 'name', value: 'steve' }], 'verbose assigned string')

    params = getopt(pattern, [ '-a', 3 ])
    assert(params, [{ name: 'ambiguous', value: true }], 'short opt makes it unambigouus')
    params = getopt(pattern, [ '-A', 3 ])
    assert(params, [{ name: 'arbitrary', value: true }], 'short opt match')

    params = getopt(pattern, [ '-aA' ])
    assert(params, [{
        name: 'ambiguous', value: true
    }, {
        name: 'arbitrary', value: true
    }], 'catenated short opt without argument')

    params = getopt(pattern, [ '-c', 'one=1', '--config=two=2', '--config', 'three=3' ])
    assert(params, [{
        name: 'config', value: 'one=1'
    }, {
        name: 'config', value: 'two=2'
    }, {
        name: 'config', value: 'three=3'
    }], 'array')

    var argv = [ '-p', '3', '--', '-A' ]
    params = getopt(pattern, argv)
    assert(argv, [ '--', '-A' ], 'stop on double hyphens')
    assert(params, [{ name: 'processes', value: '3' }], 'stop on double hyphens params')

    var argv = [ '-a', '-p', '3' ]
    assert(getopt(pattern, argv), [
        { name: 'ambiguous', value: true },
        { name: 'processes', value: '3' }
    ], 'ordered')

    function failed (args, expected, message) {
        try {
            getopt(pattern, args)
        } catch (error) {
            assert(error.abend, expected, message)
            return
        }
        throw new Error
    }

    failed([ '-ax' ], 'unknown argument', 'unknown')
    failed([ '-c' ], 'missing argument', 'terse missing')
    failed([ '--c' ], 'missing argument', 'verbose inferred missing')
    failed([ '--a' ], 'ambiguous argument', 'ambiguous')
    failed([ '--ambiguous=1' ], 'unexpected argument value', 'value to long toggle')
}
