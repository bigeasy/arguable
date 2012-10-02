#!/usr/bin/env node

/*
  usage: basic [options] [files]
    -c, --config <key=value> @

  :usage
*/


const USAGE = 'usage: basic [options] [files]\n' +
              '  -c, --config <key=value>\n' +
              ''

require('proof')(2, function (ok, equal) {
  var arguable = require('../..')
    ;

  function main (options) {
    throw new Error('usage');
  }

  function error (usage, message) {
    ok(message == null, 'no message');
    equal(usage, USAGE, 'usage');
  }
  
  arguable.parse('en_US', __filename, main, error);
});
