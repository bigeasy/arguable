var cadence = require('cadence')
var createUsage = require('./usage')
var getopt = require('./getopt')

function Options () {
}

Options.prototype.abend = function (message) {
    throw this._panicing = new Error(message)
}

Options.prototype.help = function () {
    throw this._helping = new Error
}

module.exports = cadence(function (async, source, env, argv, main) {
    var options = new Options
    async([function () {
        var usage = createUsage('en_US', source, [])
        options.params = {}
        options.usage = usage.message
        options.given = getopt(usage.pattern, options.params, argv, function (message) {
            options.abend(message)
        })
        main(options, async())
    }, function (errors, error) {
        if (error === options._helping) {
        } else if (error === options._panicing) {
        } else {
            throw errors
        }
    }], function () {
        console.log('here')
    })
})
