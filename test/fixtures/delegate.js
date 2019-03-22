require('../..')(module, {
    $destructible: true
}, require('cadence')(function (async, destructible, arguable, options) {
    destructible.destroy()
    return []
}))
