#!/usr/bin/env node

require('proof')(6, function (assert) {
    var pat = '-a,--ambiguous:!|-A,--arbitrary:!|-N,--name:$|' +
        '-p,--processes:#|-c,--config@$|-h,--help:!|'
    var getopt = require('../../getopt'), params
    var given = getopt(pat, params = {}, [ '-N', 'steve'])
    assert(given, [ 'name' ], 'string given')
    assert(params, { config: [], name: 'steve' }, 'terse string')
    getopt(pat, params = {}, [ '-Nsteve'])
    assert(params, { config: [], name: 'steve' }, 'terse mushed string')
    getopt(pat, params = {}, [ '--name', 'steve'])
    assert(params, { config: [], name: 'steve' }, 'verbose string')
    getopt(pat, params = {}, [ '--n', 'steve'])
    assert(params, { config: [], name: 'steve' }, 'verbose abbrevated string')
    getopt(pat, params = {}, [ '--name=steve'])
    assert(params, { config: [], name: 'steve' }, 'verbose assigned string')
})
