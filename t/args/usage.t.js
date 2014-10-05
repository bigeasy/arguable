#!/usr/bin/env node

/*
  ___ usage: en_US ___
  usage: basic [options] [files]
    -c, --config <key=value> @

  ___ usage ___
*/

require('proof')(7, function (equal) {
    var arguable = require('../..'),
        options,
        usage = 'usage: basic [options] [files]\n' +
                '  -c, --config <key=value>\n' +
                ''
    options = arguable.parse(__filename, [])
    equal(options.usage, usage, "usage")
    try {
        arguable.parse(__filename, [ '-x' ])
    } catch (e) {
        equal(e.message, 'There is no such argument as -x.', "unknown")
        equal(e.usage, usage, "error usage")
    }
    try {
        arguable.parse(__filename, [ '-c' ])
    } catch (e) {
        equal(e.message, 'The argument -c requires an argument value.', "terse missing")
    }
    try {
        arguable.parse(__filename, [ '--c' ])
    } catch (e) {
        equal(e.message, 'The argument --config requires an argument value.', "verbose inferred missing")
    }
    try {
        arguable.parse(__dirname + '/usage.txt', [ '--a' ])
    } catch (e) {
        equal(e.message, 'The argument --a is ambiguous.', "ambiguous")
    }
    try {
        console.log(arguable.parse(__dirname + '/usage.txt', [ '-p', 'Z' ]))
    } catch (e) {
        equal(e.message, 'The argument --processes is numeric.', "numeric")
    }
})
