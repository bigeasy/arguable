require('../..')(module, function (program, callback) {
    callback(null, program.ultimate, program.argv, program.modules.property)
}, {
     property: 1
})
