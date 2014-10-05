#!/usr/bin/env node

/*
  ___ sub _ usage: en_US ___
  usage: basic sub [files]

  ___ strings ___

    sub message:
      This is the sub message: %s.

  ___ usage: en_US ___
  usage: basic [files]

  ___ strings ___

    main message:
      This is the main message: %s.

  ___ usage ___
*/

require('proof')(4, function (equal) {
    var arguable = require('../..')
    arguable.parse(__filename, function (options) {
        equal(options.format('main message', 'x'), 'This is the main message: x.', 'main main')
        equal(options.format('sub message', 'x'), 'sub message x', 'main sub')
    })
    arguable.parse(__filename, [ 'sub' ], function (options) {
        equal(options.format('main message', 'x'), 'This is the main message: x.', 'sub main')
        equal(options.format('sub message', 'x'), 'This is the sub message: x.', 'main sub')
    })
})
