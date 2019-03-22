require('../..')(module, {
    $destructible: true
}, require('cadence')(function (async, destructible, arguable) {
    var assert = require('assert')
    arguable.options.messenger.on('message', function (message) {
        if (message.method == 'shutdown') {
            arguable.stdout.write('shutdown\n')
            destructible.destroy()
        }
    })
    return []
}))
