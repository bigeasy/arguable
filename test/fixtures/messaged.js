require('../..')(module, {
    $destructible: true
}, require('cadence')(function (async, destructible, arguable, options) {
    var assert = require('assert')
    options.messenger.on('message', function (message) {
        if (message.method == 'shutdown') {
            arguable.stdout.write('shutdown\n')
            destructible.destroy()
        }
    })
    return []
}))
