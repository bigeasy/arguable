#!/usr/bin/env node

/*

  ___ run _ usage: en_US ___
  usage: frobinate run [options] [file...] [file]

  options:

  -h, --help                  display this message
  -p, --processes     [count] number of processes to run in parallel

  description:

  frobinate will reticuatle the splines in all of your happy doodle
  files, optional in parallel. The `--processes` option is the number of
  processes to run concurrently, defaulting to zero.

  ___ compile _ usage: en_US ___
  usage: frobinate compile [options] [file...] [file]

  options:

  -h, --help                  display this message
  -s, --strict                strict interpretation of the ISO 33465
                              Frobination Standard.
  -p, --prefix                prefix for frobination identifiers

  description:

  `frobinate compile` will accelerate frobination by compling it to
  intermediate output interpreted code (IOIC) then frobinating the hell
  out it.

  ___ usage ___

*/

require('proof')(4, function (equal, ok) {
  var arguable = require('../..'), options;
  options = arguable.parse(__filename, [ 'run', '-h' ]);
  equal(options.command, 'run', 'first command');
  ok(options.params.help, 'switches');
  options = arguable.parse(__filename, [ 'compile' ]);
  equal(options.command, 'compile', 'second command');
  options = arguable.parse(__filename, [ 'missing' ]);
  ok(!options, "missing command");
});
