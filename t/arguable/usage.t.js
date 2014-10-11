#!/usr/bin/env node

/*
  ___ usage: en_US ___
  usage: basic [options] [files]
    -c, --config <key=value> @
        --longonly

  ___ usage ___
*/

require('proof')(13, function (assert) {
    var fs = require('fs'),
        path = require('path'),
        extractUsage = require('../../usage'),
        options,
        usage = 'usage: basic [options] [files]\n' +
                '  -c, --config <key=value>\n' +
                '      --longonly\n' +
                ''

    var extracted = extractUsage(__filename).usage
    assert(extracted[0].pattern, '-c,--config@$|-\t,--longonly:!|', 'extracted pattern')
    assert(extracted[0].usage, usage, 'extracted message')

    var sub = extractUsage(path.join(__dirname, 'sub.js'), [ 'run' ]).usage
    assert(sub[0].pattern, '-h,--help:!|-p,--processes:#|', 'extracted sub pattern')
    assert(sub[0].usage, fs.readFileSync(path.join(__dirname, 'sub.txt'), 'utf8'), 'extracted sub message')
    assert(sub[0].command, 'run', 'sub command')

    var i18n = extractUsage(path.join(__dirname, 'i18n.js')).usage
    assert(i18n[2].usage, 'käyttö: awaken\n\n  Hyvää huomenta!', 'i18n Finnish')
    assert(i18n[1].usage, 'uso: awaken\n\n  Buenos días!\n\nopciones:', 'i18n Spanish')

    var strings = extractUsage(path.join(__dirname, 'strings.js')).usage
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

    var none = extractUsage(path.join(__dirname, 'missing.js')).usage
    assert(none, [], 'missing')

    var none = extractUsage(path.join(__dirname, 'endless.js')).usage
    assert(none, [], 'endless')
})
