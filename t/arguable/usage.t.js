#!/usr/bin/env node

/*
  ___ usage ___ en_US ___
  usage: basic [options] [files]
    -c, --config <key=value> @
        --longonly

  ___ ___ ___
*/

require('proof')(16, function (assert) {
    var fs = require('fs'),
        path = require('path'),
        extractUsage = require('../../usage'),
        options,
        message = 'usage: basic [options] [files]\n' +
                  '  -c, --config <key=value>\n' +
                  '      --longonly\n' +
                  ''

    var usage = extractUsage(__filename)
    var extracted = usage.usage
    assert(extracted[0].pattern, '-c,--config@$|-\t,--longonly:!|', 'extracted pattern')
    assert(extracted[0].usage, message, 'extracted message')
    assert(usage.chooseUsage(null, 'xx_XX').usage, message, 'extracted message')

    var usage = extractUsage(path.join(__dirname, 'sub.js'), [ 'run' ])
    var sub = usage.usage
    assert(sub[0].pattern, '-h,--help:!|-p,--processes:#|', 'extracted sub pattern')
    assert(sub[0].usage, fs.readFileSync(path.join(__dirname, 'sub.txt'), 'utf8'), 'extracted sub message')
    assert(sub[0].command, 'run', 'sub command')
    assert(usage.chooseString('compile', 'en_US', 'example'),
        { text: 'This is an example.', order: [ 1 ] }, 'choose string for particular command')

    var i18n = extractUsage(path.join(__dirname, 'i18n.js')).usage
    assert(i18n[2].usage, 'käyttö: awaken\n\n  Hyvää huomenta!', 'i18n Finnish')
    assert(i18n[1].usage, 'uso: awaken\n\n  Buenos días!\n\nopciones:', 'i18n Spanish')

    var usage = extractUsage(path.join(__dirname, 'strings.js'))
    var strings = usage.usage
    assert(strings[1].strings['main message'], {
        text: 'This is the main message: %s.',
        order: [ 1 ]
    }, 'strings')
    assert(strings[1].strings['immediate'], {
        text: 'No space before or after.',
        order: [ 1 ]
    }, 'strings')
    assert(strings[1].strings['following'], {
        text: 'Message follows label.',
        order: [ 1 ]
    }, 'strings')
    assert(strings[1].strings['multi line'], {
        text: 'One line.\n\nAnd then another.',
        order: [ 1 ]
    }, 'strings')
    assert(usage.chooseString(null, 'xx_XX', 'main message'), {
        text: 'This is the main message: %s.',
        order: [ 1 ]
    }, 'default string')

    var none = extractUsage(path.join(__dirname, 'missing.js')).usage
    assert(none, [], 'missing')

    var none = extractUsage(path.join(__dirname, 'endless.js')).usage
    assert(none, [], 'endless')
})
