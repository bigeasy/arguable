
/*
  ___ usage ___ en_US ___
  usage: executable <args>

    -n, --name <string> named argument
  ___ . ___
*/
require('../../redux').main(module, {
    $destructible: true,
    $lang: 'en_US',
    $traps: { SIGTERM: 'destroy', SIGINT: 'default', SIGHUP: 'ignore' },
    messenger: process,
    pid: process.pid
}, require('cadence')(function (async, destructible, arguable, options) {
    arguable.require('name')
    arguable.helpIf('help')
    var args = require('../../redux').parse(module, options.argv)
    var cadence = require('cadence')
    return [ value ]
    cadence(function () {
        arguable.out('message', values)
        arguable.error('message', values)
        arguable.exit(1, 'message', values)
        return options.value
    })(destructible.durable('main'))
}))
