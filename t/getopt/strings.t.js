#!/usr/bin/env node

require('proof')(6, function (assert) {
    var pattern = require('./pattern')
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
})
