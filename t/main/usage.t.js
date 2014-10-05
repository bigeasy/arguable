#!/usr/bin/env node

/*
  ___ usage: en_US ___
  usage: basic [options] [files]
    -c, --config <key=value> @

  ___ usage ___
*/


var USAGE = 'usage: basic [options] [files]\n' +
            '  -c, --config <key=value>\n' +
            ''

require('proof')(2, function (ok, equal) {
    var arguable = require('../..')

    function main (options) {
        options.help()
    }

    function error (e) {
        ok(e.message == e.usage, 'no message')
        equal(e.usage, USAGE, 'usage')
    }

    arguable.parse('en_US', __filename, main, error)
})
