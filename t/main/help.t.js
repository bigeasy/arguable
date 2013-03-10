#!/usr/bin/env node

var usage = '\
usage: node help.js\n\
\n\
  Emits a usage message and exits successfully.\n\n\
';

var spawn = require('child_process').spawn, path = require('path');

require('proof')(2, function (equal, callback) {

  var help = spawn('node', [ path.join(__dirname, 'help.js') ]);

  var data = '';
  help.stdout.setEncoding('utf8');
  help.stdout.on('data', function (chunk) { data += chunk });
  help.on('close', function (code) {
    equal(data, usage, 'usage');
    equal(code, 0, 'exit success');
    callback();
  });
});
