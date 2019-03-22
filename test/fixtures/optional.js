require('../..')(module, {
    $destructible: true,
    property: 1
}, require('cadence')(function (async, destructible, arguable) {
    destructible.durable('response')(null, arguable.attributes.property)
    return [ arguable.attributes.property ]
}))
