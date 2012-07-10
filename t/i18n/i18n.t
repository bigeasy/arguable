#!/usr/bin/env node

require('proof')(3, function (deepEqual) {
  var arguable = require('../..')
    , options
    ;
  options = arguable.parse('xx_XX', __dirname + '/usage.txt', []);
  deepEqual(options.$usage, 'usage: awaken\n\n  Good morning!', 'Missing');
  options = arguable.parse(__dirname + '/usage.txt', []);
  deepEqual(options.$usage, 'usage: awaken\n\n  Good morning!', 'Default');
  options = arguable.parse('fi_FI', __dirname + '/usage.txt', []);
  deepEqual(options.$usage, 'käyttö: awaken\n\n  Hyvää huomenta!', 'Finish');
});
