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

require('proof')(2, function (assert) {
    var arguable = require('../..')

    function main (options) {
        options.help()
    }

    function error (e) {
        assert(e.message == e.usage, 'no message')
        assert(e.usage, USAGE, 'usage')
    }

    arguable.parse('en_US', __filename, main, error)
})
