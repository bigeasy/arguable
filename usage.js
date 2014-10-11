var fs = require('fs'), slice = [].slice

// The regular expression to match usage markdown.
var USAGE_RE = /^\s*___(?:\s+(\w+)\s+_)?\s+(usage|strings)(?::\s+((?:[a-z]{2}_[A-Z]{2})(?:\s+[a-z]{2}_[A-Z]{2})*))?\s+___\s*/

function extractUsage (source) {
    var  numeric = /^(count|number|value|size)$/

    var usage = _extractUsage(source)

    usage.forEach(function (usage) {
        usage.pattern = usage.pat = ''

        // Extract a definition of the command line arguments from the usage message
        // while tiding the usage message; removing special characters that are flags
        // to Arguable that do not belong in the usage message printed to `stdout`.
        usage.usage = usage.usage.map(function (line) {
            var verbose, terse = '-\t', type = '!', arrayed, out = '', $, trim = /^$/
            if ($ = /^(?:[\s*@]*(-[\w\d])[@\s]*,)?[@\s]*(--\w[-\w\d_]*)(?:[\s@]*[\[<]([^\]>]+)[\]>][\s@]*)?/.exec(line)) {
                out = $[0], terse = $[1] || '-\t'
                          , verbose = $[2]
                          , type = $[3] && (numeric.test($[3]) ? '#' : '$') || '!'
                          , line = line.substring(out.length)
                arrayed = ~out.indexOf('@') ? '@' : ':'
                usage.pattern = usage.pat += terse + ',' + verbose + arrayed + type + '|'
                if (!line.length) trim = /\s+$/
            }
            return (out.replace('@', ' ') + line).replace(trim, '')
        }).join('\n')
    })

    var object = {
        usage: usage,
        commands: (function () {
            var commands = {}
            usage.forEach(function (usage) {
                if (usage.command) {
                    commands[usage.command] = true
                }
            })
            return commands
        })(),
        chooseUsage: function () {
            var vargs = slice.call(arguments), command = vargs.shift(), key = vargs.pop()
            if (command) {
                usages.push.apply(usages, this.usage.filter(function (usage) {
                    return command == usage.command && !~vargs.indexOf(usage.lang)
                }.bind(this)))
            } else {
                usages.push.apply(usages, this.usage.filter(function (usage) {
                    return ! usage.command && !~vargs.indexOf(usage.lang)
                }))
            }
            if (!usages.length) {
                if (vargs.length == 1 && vargs[0] == this.usage[0].lang) {
                    return null
                } else {
                    return this.chooseString(command, this.usage[0].lang, key)
                }
            }
            return usages.shift()
        },
        chooseString: function () {
            var vargs = slice.call(arguments), command = vargs.shift(), key = vargs.pop()
            var usages = []
            if (command) {
                usages.push.apply(usages, this.usage.filter(function (usage) {
                    return command == usage.command && !~vargs.indexOf(usage.lang)
                }.bind(this)))
            }
            usages.push.apply(usages, this.usage.filter(function (usage) {
                return ! usage.command && !~vargs.indexOf(usage.lang)
            }))
            var chosen = usages.filter(function (usage) {
                return usage.strings[key]
            }).shift()
            if (!chosen) {
                if (vargs.length == 1 && vargs[0] == this.usage[0].lang) {
                    return null
                } else {
                    return this.chooseString(command, this.usage[0].lang, key)
                }
            } else {
                return usage.strings[key]
            }
        }
    }

    return object
}


// Extract a usage message from a file.
function _extractUsage (source) {
    var lines = fs.readFileSync(source, 'utf8').split(/\r?\n/),
        i, j, I, line, indent, $, candidate, _default, usage,
        message, command, match, langs,
        usages = []

    // **TODO**: Note that the test to see if we matched a line is if there is no
    // sub-command specified, or else the sub-command matches the first argument.
    // This would seem to imply that the default usage string should come last,
    // but I've not written an application that has a default usage string yet.
    //
    // Need to allow the no sub-command to match, but then get vetoed by a matched
    // sub-command.
    //
    // Note that the regular expression to match a usage line matches both the
    // beginning and ending markup, so we need to check in our outer loop that
    // we've matched beginning markup, and not ending markup, which would be an
    // odd occurrence, probably worth abenending about.

    //
    OUTER: for (i = 0, I = lines.length;i < I; i++) {
        if ($ = USAGE_RE.exec(lines[i])) {
            if (!$[3]) continue OUTER;  // Matched ending markup.
            langs = $[3].split(/\s+/)
            command = $[1]
            indent = /^(\s*)/.exec(lines[i])[1].length
            for (j = i + 1; j < I; j++) {
                if (/\S/.test(lines[j])) {
                    indent = Math.min(indent, /^(\s*)/.exec(lines[j])[1].length)
                }
                if ($ = USAGE_RE.exec(lines[j])) {
                    if (!message) {
                        message = lines.slice(i + 1, j).map(function (line) { return line.substring(indent) })
                        usage = { message: message }
                        usage.command = command || null
                    } else {
                        usage.strings = strings(lines.slice(i + 1, j))
                    }
                    if ($[2] == 'strings') {
                        i = j
                        continue
                    }
                    langs.forEach(function (lang) {
                        usage = {
                            lang: lang,
                            command: usage.command,
                            usage: usage.message,
                            strings: usage.strings || {}
                        }
                        if (!usage.command) delete usage.command
                        usages.push(usage)
                    })
                    i = j - 1
                    message = null
                    continue OUTER
                }
            }
            return []
        }
    }

    return usages
}

// Extract message strings from the strings section of a usage message.
function strings (lines) {
    var i, I, j, J, $, spaces, key, order, line, message = [], dedent = Number.MAX_VALUE, strings = {}

    OUTER: for (i = 0, I = lines.length; i < I; i++) {
        if (($ = /^(\s*)([^:(]+)(?:\((\d+(?:\s*,\s*\d+)*)\))?:\s*(.*)$/.exec(lines[i]))) {
            spaces = $[1].length, key = $[2].trim(), order = $[3] || '1', line = $[4], message = []
            if (line.length) message.push(line)
            for (i++; i < I; i++) {
                if (/\S/.test(lines[i])) {
                    $ = /^(\s*)(.*)$/.exec(lines[i])
                    if ($[1].length <= spaces) break
                    dedent = Math.min($[1].length, dedent)
                }
                message.push(lines[i])
            }
            for (j = line.length ? 1 : 0, J = message.length; j < J; j++) {
                message[j] = message[j].substring(dedent)
            }
            if (message[message.length - 1] == '') message.pop()
            strings[key] = { text: message.join('\n'), order: order.split(/\s*,\s*/) }
            i--
        }
    }

    return strings
}

module.exports = extractUsage
