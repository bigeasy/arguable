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
describe('usage', () => {
    const assert = require('assert')
    const fs = require('fs').promises
    const path = require('path')
    const Usage = require('../usage')
    const message = 'usage: basic [options] [files]\n' +
              '  -c, --config <key=value>\n' +
              '      --longonly\n' +
              ''
    it('can extract usage from a file', () => {
        const usage = Usage(__filename, 'en_US', [])
        assert.equal(usage.chooseUsage('en_US'), message, 'usage')
    })
    it('can get option patterns a file', () => {
        const usage = Usage(__filename, 'en_US', [])
        assert.deepStrictEqual(usage.getPattern(), [
        {
            terse: 'c',
            verbose: 'config',
            arguable: true,
        }, {
            terse: null,
            verbose: 'longonly',
            arguable: false
        }], 'patterns')
    })
    it('can fall back to the default usage when a language is missing', () => {
        const usage = Usage(__filename, 'en_US', [])
        assert.equal(usage.chooseUsage('en_GB'), message, 'usage')
    })
    it('can parse a file strings but with no usage', () => {
        const usage = Usage(path.join(__dirname, 'usageless.js'), 'en_US', [])
        assert.equal(usage.chooseUsage('en_GB'), '', 'no usage')
    })
    it('can format strings', () => {
        const usage = Usage(path.join(__filename), 'en_GB', [])
        assert.equal(usage.format('en_GB', 'string', []), 'value', 'format')
    })
    it('can parse a file with no definition at all', () => {
        const usage = Usage(path.join(__dirname, 'definitionless.js'), 'en_US', [])
        assert.equal(usage.chooseUsage('en_GB'), '', 'no usage')
    })
    it('can deal with missing formats', () => {
        const usage = Usage(path.join(__dirname, 'definitionless.js'), 'en_US', [])
        assert.equal(usage.format('en_US', 'string', []), 'string', 'missing format')
    })
})
