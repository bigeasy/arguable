var util = require('util')

module.exports = function (message, args) {
    var ordered = []
    for (var i = 0; i < args.length; i++) {
        ordered[i] = args[i < message.order.length ? +(message.order[i]) - 1 : i]
    }
    return util.format.apply(util, [ message.text ].concat(ordered))
}
