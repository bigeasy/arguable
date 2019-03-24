require('../..')(module, {
    $pipes: { 3: { writable: true } }
}, require('cadence')(function (async, destructible, arguable) {
    destructible.destroy()
    arguable.pipes[3].write('piped\n')
    return []
}))
