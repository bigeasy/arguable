require('../..')(module, function (program, callback) {
    callback(null, program.ultimate, program.argv, program.attribute.property)
}, {
     property: 1
})
