#!/usr/bin/env node

/*

  ___ usage: en_US ___
  usage: basic [options] [files]
    -c, --config <key=value> @

  ___ strings ___

    equals missing:
      The --config %d argument %d requires a key value pair in the form key=value.

  ___ usage ___
*/

var usage = '\
usage: node help.js\n\
\n\
  Emits a usage message and exits successfully.\n\n\
';

var USAGE = 'usage: basic [options] [files]\n' +
            '  -c, --config <key=value>\n' +
            '';

var spawn = require('child_process').spawn, path = require('path');

require('proof')(3, function (step, equal, callback) {
    var help = spawn('node', [ path.join(__dirname, 'help.js') ]),
        callback = step();

    var data = '';
    help.stdout.setEncoding('utf8');
    help.stdout.on('data', function (chunk) { data += chunk });
    help.on((/^v0.(\d+)/.exec(process.version) || [])[1] < 8 ? 'exit' : 'close', function (code) {
        equal(data, usage, 'usage');
        equal(code, 0, 'exit success');
        callback();
    });

    var message, arguable = require('../..');
    console.log = function (m) {
        message = m;
    }
    var exit = process.exit, log = console.log;
    process.exit = function () {};
    arguable.parse('en_US', __filename, function (options) {
        options.help();
    });
    equal(message, USAGE, message, 'default help');
    process.exit = exit, console.log = log;
});
