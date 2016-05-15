function getopt (patterns, argv) {
    patterns = patterns.map(function (pattern) {
        return {
            arguable: pattern.arguable,
            verbose: '--' + pattern.verbose,
            terse: pattern.terse ? '-' + pattern.terse : '',
            key: pattern.verbose
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
            return pattern.verbose.lastIndexOf(parameter, 0) == 0
                || pattern.terse.lastIndexOf(parameter, 0) == 0
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
                        context: isLong ? pattern.verbose : pattern.terse
                    }
                }
                value = argv.shift()
            }
        } else if (catenated) {
            if (isLong) {
                return {
                    abend: 'unexpected argument value',
                    context: pattern.verbose
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
// https://github.com/trentm/node-dashdash/pull/13
// http://stackoverflow.com/questions/9234258/in-python-argparse-is-it-possible-to-have-paired-no-something-something-arg/9236426#9236426
// http://stackoverflow.com/questions/9234258/in-python-argparse-is-it-possible-to-have-paired-no-something-something-arg
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
