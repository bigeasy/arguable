/*
  ___ usage ___ en_US ___
  usage: executable <args>

    Echo arguments to standard out.
  ___ . ___
*/

require('..')(module, {
    $destructible: true,
}, function (destructible, arguable, options, callback) {
    destructible.destroy()
    console.log('1..1')
    console.log('ok 1')
    callback()
})
