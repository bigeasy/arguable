require('../..')(module, function (program, callback) {
    callback(null, program.isMainModule)
})
