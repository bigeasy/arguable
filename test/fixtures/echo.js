/*
  ___ usage ___ en_US ___
  usage: node ./echo.js <args>

    Echo arguments to standard out.
  ___ . ___
*/
require('../..')(module, (arguable) => {
    arguable.options.$stdout.write(arguable.argv.join(' ') + '\n')
    return 0
})
