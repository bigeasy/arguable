require('../..')(module, {
    $destructible: true
}, require('cadence')(function (async, destructible, arguable) {
    arguable.abend(1)
}))
