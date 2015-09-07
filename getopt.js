var REGEX = new RegExp('(\\' + '/ . * + ? | ( ) [ ] { } \\'.split(' ').join('|\\') + ')', 'g')

// Create a regular expression that matches a specific string.
function regular (text) { return text.replace(REGEX, '\\$1') }

// A regex rocking argument parser implementation. It can do most of the
// manipulations of GNU `getopt`, parsing long options, short options, long
// options who's value is delimited by an equal sign, short options all mushed
// together, etc.
function getopt (pat, opts, argv, abend) {
    var arg, i = 0, $, arg, opt, l, alts, given = {}
    pat.replace(/--([^-]+)@/, function ($1, verbose) { opts[verbose] = [] })
    while (!(i >= argv.length || (argv[i] == '--' && argv.shift()) || !/^--?[^-]/.test(argv[i]))) {
        arg = argv.shift()
        arg = /^(--[^=]+)=(.*)$/.exec(arg) || /^(-[^-])(.+)$/.exec(arg) || [false, arg, true]
        alts = pat.replace(new RegExp(regular(arg[1]), 'g'), '')
                  .replace(/-[^,],--[^|]+\|/g, '')
                  .replace(/^.*((?:^|\|),[^|]+\|).*$/g, '$1')   // unambiguous match of short opt
                  .split('|')
        if ((l = alts.length - 1) != 1) abend(l ? 'ambiguous argument' : 'unknown argument', arg[1])
        opt = (arg[1] + /,([^:@]*)/.exec(alts[0])[1]).replace(/^(-[^-]+)?--/, '').replace(/-/g, '')
        $ = /([:@])(.)$/.exec(alts[0])
        if ($[2] != '!') {
            if (!arg[0]) {
                if (!argv.length) abend('missing argument',  arg[1][1] != '-' ? arg[1] : '--' + opt)
                arg[2] = argv.shift()
            }
            if ($[2] == '#' && isNaN(arg[2] = parseFloat(arg[2]))) abend('numeric argument', '--' + opt)
        } else if (arg[0]) {
            if (arg[1][1] != '-') {
                argv.unshift('-' + arg[2])
            } else {
                abend('toggle argument', '--' + opt)
            }
        }
        given[opt] = true
        if (opts[opt]) opts[opt].push(arg[2])
        else opts[opt] = [ arg[2] ]
    }
    return Object.keys(given)
}

module.exports = getopt
