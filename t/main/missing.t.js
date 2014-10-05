#!/usr/bin/env node

/*
  ___ missed _ usage: en_US ___
  usage: basic [options] [files]
    -c, --config <key=value> @

  ___ usage ___
*/


const USAGE = 'usage: basic [options] [files]\n' +
              '  -c, --config <key=value>\n' +
              ''

require('proof')(1, function (equal) {
    var arguable = require('../..')

    function main () {
    }

    function error () {
    }

    try {
        arguable.parse('en_US', __filename, [ 'missing' ], main, error)
    } catch (e) {
        equal(e.message, 'no usage found')
    }
})
