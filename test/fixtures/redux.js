require('../../redux').main(module, {
    $shutdown: [ 'SIGTERM' ],
    stderr: process.stderr
}, function (destructible, arguable) {
    var cadence = require('cadence')
    cadence(function () {
        return options.value
    })(destructible.durable('main')
})
