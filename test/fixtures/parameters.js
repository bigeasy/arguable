require('../..')(module, {
     property: 1
}, function (program, callback) {
    callback(null, program.ultimate, program.argv, program.attributes.property)
})
