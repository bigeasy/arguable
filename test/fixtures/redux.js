require('../../redux').main(module, {
    argv: process.argv
}, function (destructible, options) {
    var cadence = require('cadence')
    cadence(function () {
        return options.value
    })(destructible.durable('main')
})
