#!/usr/bin/env node

require('proof')(5, function (equal) {
    var arguable = require('../..'),
        options;
    options = arguable.parse(__dirname + '/usage.txt', [ '-N', 'steve' ]);
    equal(options.params.name, 'steve', 'terse string');
    options = arguable.parse(__dirname + '/usage.txt', [ '-Nsteve' ]);
    equal(options.params.name, 'steve', 'terse mushed string');
    options = arguable.parse(__dirname + '/usage.txt', [ '--name', 'steve' ]);
    equal(options.params.name, 'steve', 'verbose string');
    options = arguable.parse(__dirname + '/usage.txt', [ '--n', 'steve' ]);
    equal(options.params.name, 'steve', 'verbose abbrevated string');
    options = arguable.parse(__dirname + '/usage.txt', [ '--n=steve' ]);
    equal(options.params.name, 'steve', 'verbose assigned string');
});
