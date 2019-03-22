require('../..')(module, {
    $destructible: true
}, require('cadence')(function (async, destructible, arguable) {
    destructible.destroy()
    return [ arguable.isMainModule ]
}))
