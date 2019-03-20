require('proof')(2, require('cadence')(prove))

function prove (async, okay) {
    var Arguable = require('../redux')
    async(function () {
        var program = require('./fixtures/return')
        program({ value: 1 }, async())
    }, function (exitCode, value) {
        okay(exitCode, 0, 'exit okay')
        okay(value, 1, 'return')
    })
}
