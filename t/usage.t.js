require('proof')(4, prove)

/*
  ___ usage ___ en_US ___
  usage: basic [options] [files]
    -c, --config <key=value>
        --longonly

  ___ . ___
*/

function prove (assert) {
    var fs = require('fs'),
        path = require('path'),
        extractUsage = require('../usage'), usage,
        message = 'usage: basic [options] [files]\n' +
                  '  -c, --config <key=value>\n' +
                  '      --longonly\n' +
                  ''

    usage = extractUsage(__filename, 'en_US', [])
    assert(usage.chooseUsage('en_US'), message, 'usage')
    assert(usage.getPattern(), [
    {
        terse: 'c',
        verbose: 'config',
        arguable: true,
    }, {
        terse: null,
        verbose: 'longonly',
        arguable: false
    }], 'patterns')
    assert(usage.chooseUsage('en_GB'), message, 'usage')
    usage = extractUsage(path.join(__dirname, 'usageless.js'), 'en_US', [])
    assert(usage.chooseUsage('en_GB'), '', 'no usage')
}
