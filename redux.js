var run = require('./run')

var createUsage = require('./usage')

var Destructible = require('destructible')
var getopt = require('./getopt')

exports.parse = function (source, argv) {
    if (source instanceof module.constructor) {
        source = module.filename
    }
}

exports.main = function () {
    var vargs = []
    vargs.push.apply(vargs, arguments)
    var module = vargs.shift()
    var source = typeof vargs[0] == 'string' ? vargs.shift() : module.filename
    var options = typeof vargs[0] == 'object' ? vargs.shift() : {}
    var system = {}, user = {}
    for (var key in options) {
        if (key[0] == '$') {
            system[key] = options[key]
        } else {
            user[key] = options[key]
        }
    }
    var usage = createUsage(source)
    var lang = process.env.LANG ? process.env.LANG.split('.')[0] : usage.language
    var main = vargs.shift()
    var patterns = usage.getPattern()
    var arguable = patterns.filter(function (pattern) {
        return pattern.arguable
    }).map(function (pattern) {
        return pattern.verbose
    })
    module.exports = function (options, callback) {
        var argv = options

        if (!Array.isArray(argv)) {
            argv = [ argv ]
        }

        var parameters = []
        argv = argv.slice()
        while (argv.length != 0) {
            var argument = argv.shift()
            switch (typeof argument) {
            case 'object':
                if (Array.isArray(argument)) {
                    argv.unshift.apply(argv, argument)
                } else {
                    var unshift = []
                    for (var name in argument) {
                        unshift.push('--' + name, argument[name].toString())
                    }
                    argv.unshift(unshift)
                }
                break
            default:
                parameters.push(argument)
                break
            }
        }

        try {
            var gotopts = getopt(patterns, argv)
        } catch (error) {
            console.log(error.stack)
            abend(error.abend, error.context)
        }

        var terminal = null
        if (terminal = argv[0] == '--')  {
            argv.shift()
        }

        var destructible = new Destructible(module.filename)
        var shutdown = [ 'SIGINT', 'SIGTERM', 'SIGHUP' ]
        if ('$shutdown' in options) {
            shutdown = options.$shutdown
        }
        if (!shutdown) {
            shutdown = []
        }
        shutdown.forEach(function (signal) {
            process.on(signal, destructible.destroy.bind(destructible))
        })
        destructible.completed.wait(function () {
            var vargs = []
            vargs.push.apply(vargs, arguments)
            console.log(vargs)
            if (!vargs[0]) {
                vargs.splice(1, 0, 0)
            }
            callback.apply(null, vargs)
        })
        main(destructible, options)
    }
    run(module, process, user)
}
