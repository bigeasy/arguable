#!/usr/bin/env node

require('proof')(17, function (assert) {
    var pattern = '-a,--ambiguous:!|-A,--arbitrary:!|-N,--name:$|' +
        '-p,--processes:$|-c,--config@$|-h,--help:!|'
    var getopt = require('../../getopt'), params
    var given = getopt(pattern, [ '-N', 'steve']).given
    assert(given, [ 'name' ], 'string given')
    var params = getopt(pattern, [ '-N', 'steve']).params
    assert(params, { config: [], name: [ 'steve' ] }, 'terse string')
    params = getopt(pattern, [ '-Nsteve']).params
    assert(params, { config: [], name: [ 'steve' ] }, 'terse mushed string')
    params = getopt(pattern, [ '--name', 'steve']).params
    assert(params, { config: [], name: [ 'steve' ] }, 'verbose string')
    params = getopt(pattern, [ '--n', 'steve']).params
    assert(params, { config: [], name: [ 'steve' ] }, 'verbose abbrevated string')
    params = getopt(pattern, [ '--name=steve']).params
    assert(params, { config: [], name: [ 'steve' ] }, 'verbose assigned string')

    params = getopt(pattern, [ '-a', 3 ]).params
    assert(params, { config: [], ambiguous: [ true ] }, 'short opt makes it unambigouus')
    params = getopt(pattern, [ '-A', 3 ]).params
    assert(params, { config: [], arbitrary: [ true ] }, 'short opt match')
    assert(!('ambiguous' in params), 'boolean not added')

    getopt(pattern, [ '-aA' ])

    params = getopt(pattern, [ '-c', 'one=1', '--config=two=2', '--config', 'three=3' ]).params
    assert(params, { config: [ 'one=1', 'two=2', 'three=3' ] }, 'array')

    var argv = [ '-p', 3, '--', '-A' ]
    params = getopt(pattern, argv).params
    assert(argv, [ '-A' ], 'stop on double hyphens')
    assert(params, { config: [], processes: [ '3' ] }, 'stop on double hyphens params')

    function failed (args, expected, message) {
        var outcome = getopt(pattern, args)
        assert(outcome.abend, expected, message)
    }

    failed([ '-x' ], 'unknown argument', 'unknown')
    failed([ '-c' ], 'missing argument', 'terse missing')
//    failed([ '--p', 2, '--p', 3 ], 'scalar argument', 'duplicate argument')
    failed([ '--c' ], 'missing argument', 'verbose inferred missing')
    failed([ '--a' ], 'ambiguous argument', 'ambiguous')
    failed([ '--ambiguous=1' ], 'toggle argument', 'value to long toggle')
})
