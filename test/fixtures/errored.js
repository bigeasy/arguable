require('../..')(module, require('cadence')(function (async, destructible, arguable) {
    throw new Error('panic')
}))
