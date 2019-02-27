/*
  ___ usage ___ en_US ___
  usage: send

    Send a message to the parent.
  ___ . ___
*/

require('../..')(module, function (options, callback) {
    options.send({ key: 'value' })
    callback()
})
