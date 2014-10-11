var slice = [].slice
var cadence = require('cadence')
var createUsage = require('./usage')
var getopt = require('./getopt')

module.exports = cadence(function (async, source, env, argv, io, main) {
    var options = {}, usage
    async([function () {
        usage = createUsage('en_US', source, []).shift()
        options.params = {}
        options.usage = usage.message
        options.abend = function () {
            var vargs = slice.call(arguments), string = vargs.shift()
            var message = usage.strings[string] || { text: string, order: [] }
            var formatted = require('./format')(message, vargs)
            this._redirect = 'stderr'
            throw this._thrown = new Error(formatted)
        }
        options.help = function () {
            this._redirect = 'stdout'
            throw this._thrown = new Error(usage.usage)
        }
        options.argv = argv = argv.slice()
        options.stdout = io.stdout
        options.stderr = io.stderr
        options.stdin = io.stdin
        options.given = getopt(usage.pattern, options.params, argv, function (message) {
            options.abend(message)
        })
        main(options, async())
    }, function (errors, error) {
        if (error === options._thrown) {
            io[options._redirect].write(error.message)
            io[options._redirect].write('\n')
        } else {
            throw errors
        }
    }])
})
