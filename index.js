/*

    ___ usage: en_US ___
    ___ strings ___

      ambiguous argument:
        The argument %s is ambiguous.

      unknown argument:
        There is no such argument as %s.

      missing argument:
        The argument %s requires an argument value.

      numeric argument:
        The argument %s is numeric.

      toggle argument:
        The argument %s does not take a value.

      scalar argument:
        The argument %s can only be specified once.

    ___ usage ___

 */
var slice = [].slice, path = require('path'), fs = require('fs'), util = require('util')

var getopt = require('./getopt')
/*
function die () {
  console.log.apply(console, slice.call(arguments, 0))
  process.exit(1)
}

function say () {
  console.log.apply(console, slice.call(arguments, 0))
}
*/

// Extract a usage message from a file.
function extractUsage (lang, source, argv) {
    var lines = fs.readFileSync(source, 'utf8').split(/\r?\n/),
        i, j, I, line, indent, $, candidate, _default, usage,
        message, command, match, langs

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
            if ((!$[1] || $[1] == argv[0]) && (!_default || ~langs.indexOf(lang))) {
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
                            if (command) usage.command = command
                        } else {
                            usage.strings = strings(lines.slice(i + 1, j))
                        }
                        if ($[2] == 'strings') {
                            i = j
                            continue
                        }
                        if (!_default) _default = usage
                        if (~langs.indexOf(lang)) {
                            usage["default"] = _default
                            return usage
                        }
                        i = j - 1
                        message = null
                        continue OUTER
                    }
                }
                return null
            }
        }
    }

    if (_default) _default["default"] = _default

    return _default
}

// The regular expression to match usage markdown.
var USAGE_RE = /^\s*___(?:\s+(\w+)\s+_)?\s+(usage|strings)(?::\s+((?:[a-z]{2}_[A-Z]{2})(?:\s+[a-z]{2}_[A-Z]{2})*))?\s+___\s*/

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

// First argument is optionally a language identifier. This is easily obtained
// from the environment and passed in as the first argument. The first required
// argument is the file used to for a usage strings, followed by arguments,
// which are flattened. And optional callback is the final argument. If provided
// the callback is invoked with the options array. Any exception thrown is
// reported. If it begins with something that looks like an error warning, then
// the stack trace is suppressed and the error message is followed by usage.

function parse () {
    var vargs = slice.call(arguments, 0), lang = 'en_US',
        flags = {}, numeric = /^(count|number|value|size)$/,
        arg, arrayed = {}, pat = '', $,
        main, message, ordered, formatted, abended

    // Caller provisioned error handler.
    if (typeof vargs[vargs.length - 2] == 'function') abended = vargs.pop()

    // Caller provisioned main function.
    if (typeof vargs[vargs.length - 1] == 'function') main = vargs.pop()

    if (!abended) {
        if (main) abended = function (e) {
            switch (e.arguable ? e.arguable.type : '') {
            case "help":
                console.log(e.usage)
                process.exit(0)
                break
            case "abend":
                console.log(e.message)
                process.exit(1)
                break
            default:
                throw e
            }
        }
        else abended = function (e) { throw e }
    }

    // Caller specified language string.
    if (($ = /^(\w{2}_\w{2})(?:\.[\w\d-]+)?$/.exec(vargs[0])) && vargs.shift()) lang = $[1]

    var source = vargs.shift()                      // File in which to look for usage.
    var argv = vargs.shift() || []
    var usage = extractUsage(lang, source, argv)    // Extract a usage message.

    // No usage message is a programmer's error; throw a plain old exception.
    if (!usage) throw new Error("no usage found")

    // When invoked with a sub-command, adjust `argv`.
    if (usage.command) {
        argv.shift()
    }

    // Extract a definition of the command line arguments from the usage message
    // while tiding the usage message; removing special characters that are flags
    // to Arguable that do not belong in the usage message printed to `stdout`.
    usage.message = usage.message.map(function (line) {
        var verbose, terse = '-\t', type = '!', arrayed, out = '', $, trim = /^$/
        if ($ = /^(?:[\s*@]*(-[\w\d])[@\s]*,)?[@\s]*(--\w[-\w\d_]*)(?:[\s@]*[\[<]([^\]>]+)[\]>][\s@]*)?/.exec(line)) {
            out = $[0], terse = $[1] || '-\t'
                      , verbose = $[2]
                      , type = $[3] && (numeric.test($[3]) ? '#' : '$') || '!'
                      , line = line.substring(out.length)
            arrayed = ~out.indexOf('@') ? '@' : ':'
            pat += terse + ',' + verbose + arrayed + type + '|'
            if (!line.length) trim = /\s+$/
        }
        return (out.replace('@', ' ') + line).replace(trim, '')
    }).join('\n')

    // Set the messages that we'll use for parse error reporting and parse the
    // command line, then set the messages to the user provided messages.
    var messages = [ extractUsage(lang, __filename, []) ]
    try {
        var options = new Options(usage)
        options.fatal = function (e) {
            if (!e) return
            switch (e.arguable ? e.arguable.type : '') {
            case "help":
                e.type = "help"
                e.usage = messages[0].message
                e.message = messages[0].message
                abended(e)
                break
            case "abend":
                message = chooseMessage(messages, e.message)
                e.message = formatMessage(message, e.arguments)
                e.usage = options.usage
                e.format = {
                    text: message.text,
                    order: message.order,
                    args: message.arguments
                }
                abended(e)
                break
            default:
                abended(e)
            }
        }
        options.given = getopt(pat, options.params = {}, argv, abend)
        options.argv = argv
        messages = [ options._usage ]
        if (options.command) {
            var primaryUsage = extractUsage(lang, source, [])
            if (primaryUsage) {
                messages.push(primaryUsage)
            }
        }
        options._messages = messages
        if (main) main(options)
    } catch (e) {
        options.fatal(e)
    }
    return options
}

function formatMessage (message, args) {
    var ordered = []
    for (var i = 0; i < args.length; i++) {
        ordered[i] = args[i < message.order.length ? +(message.order[i]) - 1 : i]
    }
    return util.format.apply(util, [ message.text ].concat(ordered))
}

function chooseMessage (messages, identifier) {
    var message
    for (var i = 0; i < messages.length; i++)
        if (message = messages[i].strings[identifier]) return message
    for (var i = 0; i < messages.length; i++)
        if (message = messages[i]["default"].strings[identifier]) return message
    return { text: identifier, order: [] }
}

function Options (usage, messages) {
    this._usage = usage
    this._messages = messages
    this.usage = usage.message
    if (usage.command) this.command = usage.command
}

Options.prototype.format = function (message) {
    var vargs = slice.call(arguments, 1)
    return formatMessage(chooseMessage(this._messages, message), vargs)
}

Options.prototype.help = function (message) {
    var e = new Error(message)
    e.arguable = { type: "help" }
    throw e
}

var abend = Options.prototype.abend = function (message) {
    var e = new Error(message)
    e.arguable = { type: "abend" }
    e.arguments = slice.call(arguments, 1)
    throw e
}

module.exports.parse = parse
