var util = require('util'),
    cadence = require('cadence/redux'),
    slice = [].slice
var createUsage = require('./usage')
var getopt = require('./getopt')
var invoke = require('./invoke')

module.exports = cadence(function (async, source, env, argv, io, main) {

    // options object and selected usage
    var options = {}, usage

    // wrap in a Cadence try/catch block
    var block = async([function () {

        invoke(options, source, env, argv, io, main, async())

    }, function (error) {

        // if we threw the error, write it to the console, otherwise rethrow
        if (error === options._thrown) {

            // write message if message
            if (error.message) {
                io[options._redirect].write(error.message)
                io[options._redirect].write('\n')
            }

            // exit with error code
            return [ block, options._code ]

        } else {

            // yoiks, and away!
            throw error
        }

    }], function () {

        // zero exit code
        return [ block, 0 ]

    })()

})
