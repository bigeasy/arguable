/*
  ___ usage ___ en_US ___
  usage: executable <args>

    -n, --name <string> named argument
  ___ . ___
*/
require('../..')(module, function (program, callback) {
    callback(null, program.ultimate.name)
})