/*
  ___ usage ___ en_US ___
  usage: executable <args>

    Echo arguments to standard out.
  ___ . ___
*/

require('../..')(module, function (options, callback) {
    if (options.argv.length) {
        var separator = ''
        options.argv.forEach(function (arg) {
            options.stdout.write(separator)
            options.stdout.write(arg)
            separator = ' '
        })
        options.stdout.write('\n')
    }
    callback()
})
