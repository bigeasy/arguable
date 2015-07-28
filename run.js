var util = require('util'),
    cadence = require('cadence/redux'),
    slice = [].slice
var createUsage = require('./usage')
var getopt = require('./getopt')
var invoke = require('./invoke')
var interrupt = require('./interrupt')

module.exports = cadence(function (async, source, env, argv, io, main) {

    // options object and selected usage
    var options = {}, usage

    // wrap in a Cadence try/catch block
    var block = async([function () {

        invoke(source, env, argv, io, main, async())

    }, function (error) {
        return interrupt.rescue(function (error) {
            switch (error.type) {
            case 'abend':
                io.stderr.write(error.context.message)
                io.stderr.write('\n')
                return [ block, error.context.code ]
                break
            case 'help':
                io.stdout.write(error.context.message)
                io.stdout.write('\n')
                break
            case 'exit':
                return [ block, error.context.code ]
            }
        })(error)
    }], function () {

        // zero exit code
        return [ block, 0 ]

    })()

})
