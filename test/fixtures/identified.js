require('../..')(module, {
    $destructible: [ 1 ]
}, require('cadence')(function (async, destructible, arguable) {
    destructible.destroy()
    return [ arguable.identifier ]
}))
