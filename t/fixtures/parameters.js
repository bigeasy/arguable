require('../..')(module, {
    properties: { property: 1 },
    argv: { one: 1, two: 2 }
}, function (program, callback) {
    callback(null, program.ultimate, program.argv, program.properties.property)
})
