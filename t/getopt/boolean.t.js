#!/usr/bin/env node

require('proof')(3, function (assert) {
    var pattern = require('./pattern')
    var getopt = require('../../getopt'), params
    getopt(pattern, params = {}, [ '-a', 3 ])
    assert(params, { config: [], ambiguous: true }, 'short opt makes it unambigouus')
    getopt(pattern, params = {}, [ '-A', 3 ])
    assert(params, { config: [], arbitrary: true }, 'short opt match')
    assert(!('ambiguous' in params), 'boolean not added')
})
