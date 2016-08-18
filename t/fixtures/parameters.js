require('../..')(module, {
    one: 1, two: 2
}, function (program, callback) {
    callback(null, program.ultimate, program.argv)
})
