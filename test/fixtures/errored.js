require('../..')(module, {
    $destructible: true
}, require('cadence')(function (async, destructible, arguable) {
    throw new Error('panic')
}))