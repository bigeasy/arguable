function getopt (patterns, argv) {
    patterns = patterns.map(function (pattern) {
        return {
            valuable: pattern.valuable,
            verbose: '--' + pattern.verbose,
            terse: pattern.terse ? '-' + pattern.terse : '',
            key: pattern.verbose
        }
    })

    var ordered = []

    var i = 0, terminal = false
    for (;;) {
        if (argv[0] == '--') {
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
            throw {
                abend: alternates.length ? 'ambiguous argument' : 'unknown argument',
                context: parameter
            }
        }

        var pattern = alternates.shift()
        if (pattern.valuable) {
            if (!catenated) {
                if (argv.length == 0) {
                    throw {
                        abend: 'missing argument',
                        context: isLong ? pattern.verbose : pattern.terse
                    }
                }
                value = argv.shift()
            }
        } else if (catenated) {
            if (isLong) {
                throw {
                    abend: 'unexpected argument value',
                    context: pattern.verbose
                }
            } else {
                argv.unshift('-' + value)
                value = true
            }
        }

        ordered.push({ name: pattern.key, value: value })

        i++
    }

// TODO Implement `--no-foo`.
// https://github.com/trentm/node-dashdash/pull/13
// http://stackoverflow.com/questions/9234258/in-python-argparse-is-it-possible-to-have-paired-no-something-something-arg/9236426#9236426
// http://stackoverflow.com/questions/9234258/in-python-argparse-is-it-possible-to-have-paired-no-something-something-arg
    return ordered
}

module.exports = getopt
