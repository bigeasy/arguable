#!/usr/bin/env node

require('proof')(3, function (equal) {
  var arguable = require('../..')
    , options
    ;
  options = arguable.parse(__dirname + '/usage.txt', [ '-p', 3 ]);
  equal(options.params.processes + 1, 4, 'terse numeric');
  options = arguable.parse(__dirname + '/usage.txt', [ '-p3' ]);
  equal(options.params.processes + 1, 4, 'terse mushed numeric');
  options = arguable.parse(__dirname + '/usage.txt', [ '--p', 3 ]);
  equal(options.params.processes + 1, 4, 'verbose numeric');
});
