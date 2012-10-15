#!/usr/bin/env node

/*
  ___ usage: en_US ___
  usage: basic [options] [files]
    -c, --config <key=value> @

  ___ strings ___

    equals missing:
      The --config argument requires a key value pair in the form key=value.

  ___ usage: fr_FR ___
  usage: basic [options] [files]
    -c, --config <key=value> @

  ___ strings ___

    equals missing:
      In french.

  ___ usage ___
*/

const USAGE = 'usage: basic [options] [files]\n' +
              '  -c, --config <key=value>\n' +
              ''
      ;

require('proof')(6, function (equal) {
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
  arguable.parse('fr_FR', __filename, main, abended('alternate', 'In french.'));
  arguable.parse('de_DE', __filename, main,
    abended('default', 'The --config argument requires a key value pair in the form key=value.'));
});
