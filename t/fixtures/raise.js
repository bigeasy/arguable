/*
  ___ usage ___ en_US ___
  usage: raise

    Raise an error.
  ___ . ___
*/

require('../..')(module, require('cadence')(function (async, program) {
    require('../..').raise('badness')
}))
