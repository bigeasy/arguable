#!/usr/bin/env node

require('proof')(5, function (equal) {
  var arguable = require('../..')
    , options
    ;
  options = arguable.parse(__dirname + '/usage.txt', [ '-N', 'name' ]);
  equal(options.params.config.length, 0, 'no elements');
  options = arguable.parse(__dirname + '/usage.txt', [ '-c', 'one=1', '--config=two=2', '--config', 'three=3' ]);
  equal(options.params.config.length, 3, 'three elements');
  equal(options.params.config[0], 'one=1', 'first element');
  equal(options.params.config[1], 'two=2', 'second element');
  equal(options.params.config[2], 'three=3', 'third element');
});
