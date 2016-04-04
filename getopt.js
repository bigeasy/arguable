function getopt (patterns, argv) {
    patterns = patterns.map(function (pattern) {
        return {
            arguable: pattern.arguable,
            long: '--' + pattern.long,
            short: pattern.short ? '-' + pattern.short : '',
            key: pattern.long
        }
    })

    var params = {}

    patterns.filter(function (pattern) {
        return pattern.arguable
    }).map(function (pattern) {
        params[pattern.key] = []
    })

    var i = 0
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
            return pattern.long.lastIndexOf(parameter, 0) == 0
                || pattern.short.lastIndexOf(parameter, 0) == 0
        })
        if (alternates.length != 1) {
            return {
                abend: alternates.length ? 'ambiguous argument' : 'unknown argument',
                context: parameter
            }
        }

        var pattern = alternates.shift()
        if (pattern.arguable) {
            if (!catenated) {
                if (argv.length == 0) {
                    return {
                        abend: 'missing argument',
                        context: isLong ? pattern.long : pattern.short
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
