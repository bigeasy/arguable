require('../..')(module, function (program, callback) {
    callback(null, program.ultimate, program.argv, program.attributes.property)
}, {
     property: 1
})
