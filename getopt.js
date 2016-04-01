function getopt (pat, argv) {
    var patterns = pat

    if (typeof pat == 'string') {
        patterns = pat.split('|')
        patterns.pop()
        patterns = patterns.map(function (argument) {
            var typed = argument.split(/[:@]/)
            var args = typed[0].split(',')
            if (args.length == 1) {
                args.unshift('\u0000')
            }
            return {
                arguable: typed[1] != '!',
                short: args[0],
                long: args[1],
                key: args[1].slice(2)
            }
        })
    }

    var params = {}

    patterns.filter(function (pattern) {
        return pattern.arguable
    }).map(function (pattern) {
        params[pattern.key] = []
    })

    var i = 0, unshifted = null
    for (;;) {
        if (argv[0] == '--') {
            argv.shift()
            break
        }
        if (argv.length == 0 || !/^--?[^-]/.test(argv[0])) {
            break
        }
        var arg = argv.shift()
        var $ = /^(--[^=]+)=(.*)$/.exec(arg) || /^(-[^-])(.+)$/.exec(arg) || [false, arg, true]
        var catenated = !! $[0]
        var parameter = $[1]
        var value = $[2]
        var isLong = parameter[1] == '-'
        var alternates = patterns.filter(function (pattern) {
            return pattern.long.startsWith(parameter) || pattern.short.startsWith(parameter)
        })
        if (alternates.length != 1) {
            return {
                abend: alternates.length ? 'ambiguous argument' : 'unknown argument',
                context: parameter
            }
        }

        unshifted = null

        var pattern = alternates.shift()
        if (pattern.arguable) {
            if (!catenated) {
                if (argv.length == 0) {
                    return {
                        abend: 'missing argument',
                        context: arg[1][1] != '-' ? arg[1] : '--' + opt
                    }
                }
                value = argv.shift()
            }
        } else if (catenated) {
            if (isLong) {
                return {
                    abend: 'unexpected argument value',
                    context: pattern.long
                }
            } else {
                argv.unshift('-' + value)
                unshifted = pattern.short
            }
        }

        if (!params[pattern.key]) {
            params[pattern.key] = [ value ]
        } else {
            params[pattern.key].push(value)
        }

        i++
    }

    // TODO Implement `--no-foo`.
    if (unshifted) {
        return {
            abend: 'unexpected argument value',
            context: unshifted
        }
    }

    return {
        params: params,
        given: patterns.filter(function (pattern) {
            return params[pattern.key] && params[pattern.key].length != 0
        }).map(function (pattern) {
            return pattern.key
        })
    }
}

module.exports = getopt
