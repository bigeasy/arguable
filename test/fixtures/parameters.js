require('../..')(module, {
    $destructible: true,
    property: 1
}, function (destructible, program, options, callback) {
    destructible.destroy()
    callback(null, program.ultimate, program.argv, program.attributes.property)
})
