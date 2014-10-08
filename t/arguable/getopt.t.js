#!/usr/bin/env node

require('proof')(14, function (assert) {
    var pattern = '-a,--ambiguous:!|-A,--arbitrary:!|-N,--name:$|' +
        '-p,--processes:#|-c,--config@$|-h,--help:!|'
    var getopt = require('../../getopt'), params
    var given = getopt(pattern, params = {}, [ '-N', 'steve'])
    assert(given, [ 'name' ], 'string given')
    assert(params, { config: [], name: 'steve' }, 'terse string')
    getopt(pattern, params = {}, [ '-Nsteve'])
    assert(params, { config: [], name: 'steve' }, 'terse mushed string')
    getopt(pattern, params = {}, [ '--name', 'steve'])
    assert(params, { config: [], name: 'steve' }, 'verbose string')
    getopt(pattern, params = {}, [ '--n', 'steve'])
    assert(params, { config: [], name: 'steve' }, 'verbose abbrevated string')
    getopt(pattern, params = {}, [ '--name=steve'])
    assert(params, { config: [], name: 'steve' }, 'verbose assigned string')

    getopt(pattern, params = {}, [ '-a', 3 ])
    assert(params, { config: [], ambiguous: true }, 'short opt makes it unambigouus')
    getopt(pattern, params = {}, [ '-A', 3 ])
    assert(params, { config: [], arbitrary: true }, 'short opt match')
    assert(!('ambiguous' in params), 'boolean not added')

    getopt(pattern, params = {}, [ '-c', 'one=1', '--config=two=2', '--config', 'three=3' ])
    assert(params, { config: [ 'one=1', 'two=2', 'three=3' ] }, 'array')

    getopt(pattern, params = {}, [ '-p', '3' ])
    assert(params, { config: [], processes: 3 }, 'terse numeric')
    getopt(pattern, params = {}, [ '-p3' ])
    assert(params, { config: [], processes: 3 }, 'terse mushed numeric')
    getopt(pattern, params = {}, [ '--p', '3' ])
    assert(params, { config: [], processes: 3 }, 'verbose numeric')

    // fixme: outgoing.
    getopt(pattern, params = {}, [ '--p', 'x' ], function (message) {
        assert(message, 'numeric argument')
    })
})