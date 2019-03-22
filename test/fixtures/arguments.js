/*
  ___ usage ___ en_US ___
  usage: executable <args>

    -n, --name <string> named argument
  ___ . ___
*/
require('../..')(module, module.filename, {
    $destructible: true
}, require('cadence')(function (async, destructible, arguable) {
    destructible.destroy()
    return [ arguable.ultimate.name ]
}))
