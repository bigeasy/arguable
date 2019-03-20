/*
  ___ usage ___ en_US ___
  usage: executable <args>

    -n, --name <string> named argument
  ___ . ___
*/
require('../../redux').main(module, function (destructible, arguable, options) {
    arguable.require('name')
    arguable.helpIf('help')
    var args = require('../../redux').parse(module, options.argv)
    var cadence = require('cadence')
    cadence(function () {
        return options.value
    })(destructible.durable('main'))
})
