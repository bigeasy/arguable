require('../..')(module, function (program, callback) {
    program.disconnect()
    callback(null, program.connected)
})
