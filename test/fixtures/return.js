require('../../redux').main(module, function (destructible, options) {
    var cadence = require('cadence')
    cadence(function () {
        return options.value
    })(destructible.durable('main'))
})
