#!/usr/bin/env node

/*
  usage: basic [options] [files]
    --config, -c <key=value> @

  --- arguable ---
*/

require('proof')(7, function (equal) {
  var arguable = require('../..')
    , options
    , usage = 'usage: basic [options] [files]\n' +
              '  --config, -c <key=value>\n' +
              ''
    ;
  options = arguable.parse(__filename, []);
  equal(options.$usage, usage, "usage");
  try {
    arguable.parse(__filename, [ '-x' ]);
  } catch (e) {
    equal(e.message, 'unknown option: -x', "unknown");
    equal(e.usage, usage, "error usage");
  }
  try {
    arguable.parse(__filename, [ '-c' ]);
  } catch (e) {
    equal(e.message, 'missing argument for: -c', "terse missing");
  }
  try {
    arguable.parse(__filename, [ '--c' ]);
  } catch (e) {
    equal(e.message, 'missing argument for: --config', "verbose inferred missing");
  }
  try {
    arguable.parse(__dirname + '/usage.txt', [ '--a' ]);
  } catch (e) {
    equal(e.message, 'ambiguous: --a', "ambiguous");
  }
  try {
    console.log(arguable.parse(__dirname + '/usage.txt', [ '-p', 'Z' ]));
  } catch (e) {
    equal(e.message, 'numeric option: -p', "ambiguous");
  }
});
