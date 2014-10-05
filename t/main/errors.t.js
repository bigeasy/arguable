#!/usr/bin/env node

/*
  ___ usage: en_US ___
  usage: basic [options] [files]
    -c, --config <key=value> @

  ___ strings ___

    equals missing:
      The --config %d argument %d requires a key value pair in the form key=value.

  ___ usage: fr_FR ___
  usage: basic [options] [files]
    -c, --config <key=value> @

  ___ strings ___

    equals missing (2, 1):
      In %d french %d.

  ___ usage ___
*/

var USAGE = 'usage: basic [options] [files]\n' +
             '  -c, --config <key=value>\n' +
             ''
    ;

require('proof')(8, function (equal) {
    var arguable = require('../..');

    function main (options) {
        options.abend('equals missing', 1, 2);
    }

    function abended (test, message) {
        return function (e) {
            equal(e.usage, USAGE, test + ' usage');
            equal(e.message, message, test + ' message');
        }
    }

    arguable.parse('en_US', __filename, main,
        abended('primary', 'The --config 1 argument 2 requires a key value pair in the form key=value.'));
    arguable.parse('fr_FR', __filename, main, abended('alternate', 'In 2 french 1.'));
    arguable.parse('de_DE', __filename, main,
        abended('default', 'The --config 1 argument 2 requires a key value pair in the form key=value.'));
    try {
        arguable.parse('en_US', __filename, function () {
            throw new Error('thrown');
        });
    } catch (e) {
        equal(e.message, 'thrown', 'thrown');
    }
    var message;
    var exit = process.exit, log = console.log;
    console.log = function (m) {
        message = m;
    }
    process.exit = function () {};
    arguable.parse('en_US', __filename, function (options) {
        options.abend('equals missing', 1, 2);
    });
    equal(message, 'The --config 1 argument 2 requires a key value pair in the form key=value.',
        message, 'default abend');
    process.exit = exit, console.log = log;
});
