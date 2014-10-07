#!/usr/bin/env node

require('proof')(9, function (assert) {
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
})
