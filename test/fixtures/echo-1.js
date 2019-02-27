/*
  ___ usage ___ en_US ___
  usage: executable <args>

    Echo arguments to standard out.
  ___ . ___
*/

require('../..')(module, function (program, callback) {
    console.log(program.argv)
    if (program.argv.length) {
        var separator = ''
        program.argv.forEach(function (arg) {
            program.stdout.write(separator)
            program.stdout.write(arg)
            separator = ' '
        })
        program.stdout.write('\n')
    }
    callback()
})
