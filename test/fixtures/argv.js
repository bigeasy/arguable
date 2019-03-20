/*
  ___ usage ___ en_US ___
  usage: executable <args>

    -n, --name <string> named argument
  ___ . ___
*/
require('../../redux').main(module, {
    argv: process.argv
}, function (destructible, options) {
    var args = require('../../redux').parse(module, options.argv)
    var cadence = require('cadence')
    cadence(function () {
        return options.value
    })(destructible.durable('main'))
})
