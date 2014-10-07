#!/usr/bin/env node

require('proof')(6, function (deepEqual) {
    var assert = deepEqual
    var equal = deepEqual
    var arguable = require('../..'), options
    var usage = require('../../usage'), path = require('path')
    var pat = '-a,--ambiguous:!|-A,--arbitrary:!|-N,--name:$|-p,--processes:#|-c,--config@$|-h,--help:!|'
    var getopt = require('../../getopt'), params
    var given = getopt(pat, params = {}, [ '-N', 'steve'])
    assert(given, [ 'name' ], 'string given')
    assert(params, { config: [], name: 'steve' }, 'terse string')
    getopt(pat, params = {}, [ '-Nsteve'])
    assert(params, { config: [], name: 'steve' }, 'terse mushed string')
    getopt(pat, params = {}, [ '--name', 'steve'])
    assert(params, { config: [], name: 'steve' }, 'verbose string')
    options = arguable.parse(__dirname + '/usage.txt', [ '--n', 'steve' ])
    assert(params, { config: [], name: 'steve' }, 'verbose abbrevated string')
    options = arguable.parse(__dirname + '/usage.txt', [ '--n=steve' ])
    assert(params, { config: [], name: 'steve' }, 'verbose assigned string')
})
