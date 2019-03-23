require('../..')(module, require('cadence')(function (async, destructible, arguable) {
    destructible.destroy()
    return [ arguable.isMainModule ]
}))
