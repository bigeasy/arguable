#!/usr/bin/env node

/*
  ___ usage: en_US ___
  usage: basic [options] [files]
    -c, --config <key=value> @

  ___ usage ___
*/


const USAGE = 'usage: basic [options] [files]\n' +
              '  -c, --config <key=value>\n' +
              ''

require('proof')(2, function (ok, equal) {
  var arguable = require('../..')
    ;

  function main (options) {
    options.help();
  }

  function error (usage, message) {
    ok(message == null, 'no message');
    equal(usage, USAGE, 'usage');
  }
  
  arguable.parse('en_US', __filename, main, error);
});