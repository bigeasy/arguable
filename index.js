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

var extractUsage = require('./usage')

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

// First argument is optionally a language identifier. This is easily obtained
// from the environment and passed in as the first argument. The first required
// argument is the file used to for a usage strings, followed by arguments,
// which are flattened. And optional callback is the final argument. If provided
// the callback is invoked with the options array. Any exception thrown is
// reported. If it begins with something that looks like an error warning, then
// the stack trace is suppressed and the error message is followed by usage.

function parse () {
    var vargs = slice.call(arguments, 0), lang = 'en_US',
        flags = {},
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
    var usage = extractUsage(lang, source, argv).shift()    // Extract a usage message.

    // No usage message is a programmer's error; throw a plain old exception.
    if (!usage) throw new Error("no usage found")

    // When invoked with a sub-command, adjust `argv`.
    if (usage.command) {
        argv.shift()
    }

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
        options.given = getopt(usage.pat, options.params = {}, argv, abend)
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
