require('destructible').main(module, {
    stderr: process.stderr,
    stdout: process.stdout,
    stdin: process.stdin
}, function (destructible, options) {
    var arguable = require('arguable').from(module)
    Detructible.raise('exit', 1)
    Detructible.raise('error', arguable.format('error', 1))
    var cadence = require('cadence')
    cadence(function (async) {
        async(function () {
        }, function () {
        })
    })(destructible.durable('main'))
})
