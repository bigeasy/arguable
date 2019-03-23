/*
  ___ usage ___ en_US ___
  usage: executable <args>

    Echo arguments to standard out.
  ___ . ___
*/

require('../..')(module, require('cadence')(function (async, destructible, arguable) {
    if (arguable.argv.length) {
        var separator = ''
        arguable.argv.forEach(function (arg) {
            arguable.stdout.write(separator)
            arguable.stdout.write(arg)
            separator = ' '
        })
        arguable.stdout.write('\n')
    }
    destructible.destroy()
    return []
}))
