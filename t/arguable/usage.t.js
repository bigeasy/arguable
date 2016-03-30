#!/usr/bin/env node

/*
  ___ usage ___ en_US ___
  usage: basic [options] [files]
    -c, --config <key=value>
        --longonly

  ___ . ___
*/

require('proof')(5, prove)

function prove (assert) {
    var fs = require('fs'),
        path = require('path'),
        extractUsage = require('../../usage'),
        message = 'usage: basic [options] [files]\n' +
                  '  -c, --config <key=value>\n' +
                  '      --longonly\n' +
                  ''

    var usage = extractUsage(__filename, 'en_US', [])
    assert(usage.chooseUsage('en_US', []), message, 'usage')
    assert(usage.getPattern([]), '-c,--config:$|-\t,--longonly:!|', 'pattern')
    assert(usage.chooseUsage('en_GB', []), message, 'usage')

    var usage = extractUsage(path.join(__dirname, 'sub.js'), 'en_US', [])
    assert(usage.getCommand([ 'foo', 'bar' ]), [ 'foo', 'bar' ], 'non executable path')
    assert(usage.getCommandRedux([ 'foo', 'bar' ]).command, [ 'foo', 'bar' ], 'non executable path')
}
