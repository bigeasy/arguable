/*
  ___ usage ___ en_US ___
  name:

    executable - my executable

  synopsis:

    executable [--name <name>] [--bind <port|interface:port>]
               [--help] [--] <files>

  options:

    -n, --name <name> [string:required]
        named argument

    -b, --bind <port|interface:port> [bindable]
        bind to the interface

    --status

    --no-status [negate("never-")]
        do not display a status

    --never-status [negate("never-")]
        alias for `--no-status`

    -h
        show this help message
  ___ . ___
*/
require('./es6')(module, { $stdout: process.stdout }, async (arguable) => {
    if (arguable.complete) {
        return [ "foo", "bar", "baz" ]
    } else {
        arguable.options.$stdout.write('hello, world\n')
        return 0
    }
})
