#!/usr/bin/env node

require('proof')(3, function (deepEqual) {
    var arguable = require('../..'), options
    options = arguable.parse(__dirname + '/usage.txt', [ '-N', 'name' ])
    deepEqual(options.given, [ 'name' ], 'no arrays')
    options = arguable.parse(__dirname + '/usage.txt', [ '-Nname', '-c', 'one=1', '--config', 'three=3' ])
    deepEqual(options.given, [ 'name', 'config' ], 'arrays')
    deepEqual(Object.keys(options.params).sort(), [ 'config', 'name' ], 'parmas')
})
