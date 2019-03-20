var run = require('./run')

var createUsage = require('./usage')

var Destructible = require('destructible')

exports.parse = function (source, argv) {
    if (source instanceof module.constructor) {
        source = module.filename
    }
}

exports.main = function () {
    var vargs = []
    vargs.push.apply(vargs, arguments)
    var module = vargs.shift()
    var options = typeof vargs[0] == 'object' ? vargs.shift() : {}
    var main = vargs.shift()
    module.exports = function (options, callback) {
        var destructible = new Destructible(module.filename)
        destructible.completed.wait(function () {
            var vargs = []
            vargs.push.apply(vargs, arguments)
            if (!vargs[0]) {
                vargs.splice(1, 0, 0)
            }
            callback.apply(null, vargs)
        })
        main(destructible, options)
    }
    run(module, process, options)
}
