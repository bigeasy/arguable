/*
  ___ usage: en_US ___
  usage: executable <args>

    Echo arguments to standard out.
  ___ usage ___
*/

require('../../../executable')(module, function (options, stdout, stderr, stdin, callback) {
    if (options.argv.length) {
        var separator = ''
        options.argv.forEach(function (arg) {
            stdout.write(separator)
            stdout.write(arg)
            separator = ' '
        })
        stdout.write('\n')
    }
    callback()
})
