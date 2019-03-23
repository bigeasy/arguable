require('../..')(module, {
    pid: process.pid
}, require('cadence')(function (async, destructible, arguable) {
    destructible.durable('response')(null, arguable.options.pid)
    return [ arguable.options.pid ]
}))
