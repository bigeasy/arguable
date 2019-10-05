/*
  ___ usage ___ en_US ___
  usage: basic [options] [files]
    -c, --config <key=value>
        --longonly

  ___ $ ___ en_GB ___

    string:
        value

  ___ . ___
*/
require('proof')(7, (okay) => {
    const fs = require('fs').promises
    const path = require('path')
    const Usage = require('../usage')
    const message = 'usage: basic [options] [files]\n' +
              '  -c, --config <key=value>\n' +
              '      --longonly\n' +
              ''
    {
        const usage = Usage(__filename, 'en_US', [])
        okay(usage.chooseUsage('en_US'), message, 'usage from file')
    }
    {
        const usage = Usage(__filename, 'en_US', [])
        okay(usage.getPattern(), [
        {
            terse: 'c',
            verbose: 'config',
            valuable: true,
        }, {
            terse: null,
            verbose: 'longonly',
            valuable: false
        }], 'patterns from file')
    }
    {
        const usage = Usage(__filename, 'en_US', [])
        okay(usage.chooseUsage('en_GB'), message, 'fall back to default language')
    }
    {
        const usage = Usage(path.join(__dirname, 'usageless.js'), 'en_US', [])
        okay(usage.chooseUsage('en_GB'), '', 'parse a file wtih strings but no usage')
    }
    {
        const usage = Usage(path.join(__filename), 'en_GB', [])
        okay(usage.format('en_GB', 'string', []), 'value', 'format strings')
    }
    {
        const usage = Usage(path.join(__dirname, 'definitionless.js'), 'en_US', [])
        okay(usage.chooseUsage('en_GB'), '', 'no usage at all')
    }
    {
        const usage = Usage(path.join(__dirname, 'definitionless.js'), 'en_US', [])
        okay(usage.format('en_US', 'string', []), 'string', 'missing format')
    }
})
