#!/usr/bin/env node

/*
  ___ usage: en_US ___
  usage: basic [options] [files]
    -c, --config <key=value> @
        --longonly

  ___ usage ___
*/

require('proof')(16, function (assert) {
    var fs = require('fs'),
        path = require('path'),
        extractUsage = require('../../usage'),
        options,
        usage = 'usage: basic [options] [files]\n' +
                '  -c, --config <key=value>\n' +
                '      --longonly\n' +
                ''

    var extracted = extractUsage('en_US', __filename, [])
    assert(extracted.pattern, '-c,--config@$|-\t,--longonly:!|', 'extracted pattern')
    assert(extracted.message, usage, 'extracted message')
    assert(extracted === extracted['default'], 'extracted default')


    var sub = extractUsage('en_US', path.join(__dirname, 'sub.js'), [ 'run' ])
    assert(sub.pattern, '-h,--help:!|-p,--processes:#|', 'extracted sub pattern')
    assert(sub.message, fs.readFileSync(path.join(__dirname, 'sub.txt'), 'utf8'), 'extracted sub message')
    assert(sub.command, 'run', 'sub command')
    assert(sub === sub['default'], 'sub default')

    var fallback = extractUsage('xx_XX', path.join(__dirname, 'i18n.js'), [])
    assert(fallback.message, 'usage: awaken\n\n  Good morning!', 'i18n missing')
    var fi_FI = extractUsage('fi_FI', path.join(__dirname, 'i18n.js'), [])
    assert(fi_FI.message, 'käyttö: awaken\n\n  Hyvää huomenta!', 'i18n Finnish')
    var es_ES = extractUsage('es_ES', path.join(__dirname, 'i18n.js'), [])
    assert(es_ES.message, 'uso: awaken\n\n  Buenos días!\n\nopciones:', 'i18n Spanish')

    var strings = extractUsage(null, path.join(__dirname, 'strings.js'), [])
    assert(strings.strings['main message'], {
        text: 'This is the main message: %s.',
        order: [ 1 ]
    }, 'strings')
    assert(strings.strings['immediate'], {
        text: 'No space before or after.',
        order: [ 1 ]
    }, 'strings')
    assert(strings.strings['following'], {
        text: 'Message follows label.',
        order: [ 1 ]
    }, 'strings')
    assert(strings.strings['multi line'], {
        text: 'One line.\n\nAnd then another.',
        order: [ 1 ]
    }, 'strings')

    var none = extractUsage('en_US', path.join(__dirname, 'sub.js'), [ 'missing' ])
    assert(none == null, 'missing')

    var none = extractUsage('en_US', path.join(__dirname, 'endless.js'), [])
    assert(none == null, 'endless')
})
