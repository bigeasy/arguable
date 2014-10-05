#!/usr/bin/env node

require('proof')(3, function (equal) {
    var arguable = require('../..'), options
    options = arguable.parse(__dirname + '/usage.txt', [ '-a', 3 ])
    equal(options.params.ambiguous, true, 'short opt makes it unambigouus')
    options = arguable.parse(__dirname + '/usage.txt', [ '-A', 3 ])
    equal(options.params.arbitrary, true, 'short opt match')
    equal(('ambiguous' in options.params), false, 'boolean not added')
})
