require('../..')(module, {
    $trap: { SIGINT: 'default' }
}, require('cadence')(function (async, destructible, arguable) {
    var destructed = [ false ]
    destructible.destruct.wait(function () {
        destructed[0] = true
    })
    return [ destructed ]
}))
