#!/usr/bin/env node

/*
  usage: basic [options] [files]
    -c, --config <key=value> @

  errors:

    equals missing:
      The --config argument requires a key value pair in the form key=value.
    de_DE:
      In german.
    de_DE:
      In french.

  :errors
*/

const USAGE = 'usage: basic [options] [files]\n' +
              '  -c, --config <key=value>\n' +
              ''
      ;

require('proof')(2, function (equal) {
  var arguable = require('../..');

  function main (options) {
    throw new Error('equals missing');
  }

  function abended (test, message) {
    return function (usage, $message) {
      equal(usage, USAGE, test + ' usage');
      equal($message, message, test + ' message');
    }
  }
  
  arguable.parse('en_US', __filename, main,
    abended('primary', 'The --config argument requires a key value pair in the form key=value.'));
  arguable.parse('fr_FR', __filename, main, abended('alternate', 'In french'));
});
