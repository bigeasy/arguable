var slice = [].slice, path = require('path'), fs = require('fs');

function die () {
  console.log.apply(console, slice.call(arguments, 0));
  process.exit(1);
}

function say () {
  console.log.apply(console, slice.call(arguments, 0));
}

// Create a regular expression that matches a specific string.
function regular (text) { return text.replace(REGEX, '\\$1') }

var REGEX = new RegExp('(\\' + '/ . * + ? | ( ) [ ] { } \\'.split(' ').join('|\\') + ')', 'g');

// Exract a usage message from a file.
function extractUsage (lang, source, argv) {
  var lines = fs.readFileSync(source, 'utf8').split(/\r?\n/),
      i, j, I, line, indent, $, candidate, _default, usage,
      message, command, match, langs;

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
  // odd occurance, probably worth abenending about.

  //
  OUTER: for (i = 0, I = lines.length;i < I; i++) {
    if ($ = USAGE_RE.exec(lines[i])) {
      if (!$[3]) continue OUTER;  // Matched ending markup.
      langs = $[3].split(/\s+/);
      if ((!$[1] || $[1] == argv[0]) && (!_default || ~langs.indexOf(lang))) {
        command = $[1];
        indent = /^(\s*)/.exec(lines[i])[1].length;
        for (j = i + 1; j < I; j++) {
          if (/\S/.test(lines[j])) {
            indent = Math.min(indent, /^(\s*)/.exec(lines[j])[1].length);
          }
          if ($ = USAGE_RE.exec(lines[j])) {
            if (!message) {
              message = lines.slice(i + 1, j).map(function (line) { return line.substring(indent) });
              usage = { message: message };
              if (command) usage.command = command;
            } else {
              usage.errors = errors(lines.slice(i + 1, j));
            }
            if ($[2] == 'strings') {
              i = j;
              continue;
            }
            if (!_default) _default = usage;
            if (~langs.indexOf(lang)) {
              usage["default"] = _default;
              return usage;
            }
            i = j - 1;
            message = null;
            continue OUTER;
          }
        }
        return null;
      }
    }
  }

  if (_default) _default["default"] = _default;

  return _default;
}

// The regular expression to match usage markdown.
var USAGE_RE = /^\s*___(?:\s+(\w+)\s+_)?\s+(usage|strings)(?::\s+((?:[a-z]{2}_[A-Z]{2})(?:\s+[a-z]{2}_[A-Z]{2})*))?\s+___\s*/;

// Extract message strings from the errors section of a usage message.
function errors (lines) {
  var i, I, j, J, $, spaces, key, line, message = [], dedent = Number.MAX_VALUE, errors = {};

  OUTER: for (i = 0, I = lines.length; i < I; i++) {
    if (($ = /^(\s*)([^:]+):\s*(.*)$/.exec(lines[i]))) {
      spaces = $[1].length, key = $[2], line = $[3], message = [];
      if (line.length) message.push(line);
      for (i++; i < I; i++) {
        if (/\S/.test(lines[i])) {
          $ = /^(\s*)(.*)$/.exec(lines[i]);
          if ($[1].length <= spaces) break;
          dedent = Math.min($[1].length, dedent);
        }
        message.push(lines[i]);
      }
      for (j = line.length ? 1 : 0, J = message.length; j < J; j++) {
        message[j] = message[j].substring(dedent);
      }
      if (message[message.length - 1] == '') message.pop();
      errors[key] = message.join('\n');
      i--;
    }
  }

  return errors;
}

// First argument is optionally a language identifier. This is easily obtained
// from the environment and passed in as the first argument. The first required
// argument is the file used to for a usage strings, followed by arguments,
// which are flattened. And optional callback is the final argument. If provided
// the callback is invoked with the options array. Any exception thrown is
// reported. If it begins with something that looks like an error warning, then
// the stack trace is supressed and the error message is followed by usage.

function parse () {
  var vargs = slice.call(arguments, 0), lang = 'en_US',
      flags = {}, numeric = /^(count|number|value|size)$/,
      arg, arrayed = {}, pat = '', $ , main, errors, message;


  function abended (usage, message) {
    if (!usage) throw new Error("no usage message");
    if (message) {
      console.log(message);
      process.exit(1);
    } else {
      console.log(usage);
      process.exit(0);
    }
  }

  // Caller provisioned error handler.
  if (typeof vargs[vargs.length - 2] == 'function') abended = vargs.pop();

  // Caller provisioned main function.
  if (typeof vargs[vargs.length - 1] == 'function') main = vargs.pop();

  // Caller specified language string.
  if (($ = /^(\w{2}_\w{2})(?:\.[\w\d-]+)?$/.exec(vargs[0])) && vargs.shift()) lang = $[1];

  var source = vargs.shift();                     // File in which to look for usage.
  var argv = flatten(vargs);                      // Flatten arguments.
  var usage = extractUsage(lang, source, argv); // Extract a usage message.

  // No usage message found, report error and return `undefined`.
  if (!usage) {
    if (main) abended(null);
    return;
  }

  // Now we have a usage message, so we can begin to build our options object.

  // When invoked with a sub-command, adjust `argv`.
  if (usage.command) argv.shift();

  // Extract a definition of the command line arguments from the usage message
  // while tiding the usage message; removing special characters that are flags
  // to Arguable that do not belong in the usage message printed to `stdout`.
  usage.message = usage.message.map(function (line) {
    var verbose, terse = '-\t', type = '!', arrayed, out = '', $, trim = /^$/;
    if ($ = /^(?:[\s*@]*(-[\w\d])[@\s]*,)?[@\s]*(--\w[-\w\d_]*)(?:[\s@]*[\[<]([^\]>]+)[\]>][\s@]*)?/.exec(line)) {
      out = $[0], terse = $[1] || '-\t'
                , verbose = $[2]
                , type = $[3] && (numeric.test($[3]) ? '#' : '$') || '!'
                , line = line.substring(out.length);
      arrayed = ~out.indexOf('@') ? '@' : ':';
      pat += terse + ',' + verbose + arrayed + type + '|';
      if (!line.length) trim = /\s+$/;
    }
    return (out.replace('@', ' ') + line).replace(trim, '');
  }).join('\n');

  var options = new Options(usage);
  // Here's the legacy confusion.
  try {
    options.given = getopt(pat, options.params = {}, argv);
  } catch (e) {
    // TODO: I18n is missing from here.
    if (main) {
      console.error(e.message);
      console.error(usage.message);
    } else {
      e.usage = usage.message;
      throw e;
    }
  }
 
  // And here's the legacy bridge.
  options.argv = argv;
  if (main) {
    try {
      main(options);
    } catch (e) {
      if (e._type === Options.prototype.help) {
        abended(options._usage.message);
      } else if (e._type === Options.prototype.abend) {
        message = options._usage.errors[e.message] || options._usage["default"].errors[e.message];
        abended(options.usage, message, e._arguments || []);
      } else {
        throw e;
      }
    }
  }
  return options;
}

function Options (usage, command) {
  this._usage = usage;
  this.usage = usage.message;
  if (usage.command) this.command = usage.command;
}

Options.prototype.help = function (message) {
  var e = new Error(message);
  e._type = Options.prototype.help;
  throw e;
}

var abend = Options.prototype.abend = function (message) {
  var e = new Error(message);
  e._type = Options.prototype.abend;
  e._arguments = slice.call(arguments, 1);
  throw e;
}

// A regex rocking argument parser implementation. It can do most of the
// manipulations of GNU `getopt`, parsing long options, short options, long
// options who's value is deilmited by an equal sign, short options all mushed
// together, etc.
function getopt (pat, opts, argv) {
  var arg, i = 0, $, arg, opt, l, alts, given = {};
  pat.replace(/--([^-]+)@/, function ($1, verbose) { opts[verbose] = [] });
  while (!(i >= argv.length || (argv[i] == "--" && argv.shift()) || !/^--?[^-]/.test(argv[i]))) {
    arg = argv.shift();
    arg = /^(--[^=]+)=(.*)$/.exec(arg) || /^(-[^-])(.+)$/.exec(arg) || [false, arg, true];
    alts = pat.replace(new RegExp(regular(arg[1]), 'g'), '').replace(/-[^,],--[^|]+\|/g, '').split("|");
    if ((l = alts.length - 1) != 1) abend((l ? "ambiguous: " : "unknown option: ") + arg[1], true);
    opt = (arg[1] + /,([^:@]*)/.exec(alts[0])[1]).replace(/^(-[^-]+)?--/, '').replace(/-/g, '');
    $ = /([:@])(.)$/.exec(alts[0]);
    if ($[2] != '!') {
      if ($[1].length == 1 || (argv.length && argv[0][0] != "-")) {
        if (!arg[0]) {
          if (!argv.length) abend("missing argument for: " + (arg[1][1] != "-" ? arg[1] : "--" + opt), true);
          arg[2] = argv.shift();
        }
        if ($[2] == '#' && isNaN(arg[2] = +arg[2])) abend("numeric option: --" + opt);
      }
    } else if (arg[0]) {
      if (arg[1][1] != "-") {
        argv.unshift("-" + arg[2]);
      } else {
        abend("option does not take value: " + (arg[1][1] != "-" ? arg[1] : "--" + opt), true);
      }
    }
    given[opt] = true;
    if ($[1] == '@') opts[opt].push(arg[2]);
    else if (opts[opt] != null) abend("option can only be secified once: " + arg[1]);
    else opts[opt] = arg[2];
  }
  return Object.keys(given);
}

// Flatten an object or an array or an arry of objects or what have you into
// long option command line parameters. This is one of the resasons we require
// that usage definitions define a long option for each parameter.
function flatten () {
  var flattened = [];
  slice.call(arguments, 0).forEach(function (arg) {
    if (arg != null) {
      if (Array.isArray(arg)) {
        flattened.push.apply(flattened, flatten.apply(this, arg));
      } else if (typeof arg == "object") {
        Object.keys(arg).forEach(function (key) {
          (Array.isArray(arg[key]) ? arg[key] : [ arg[key] ]).forEach(function (value) {
            flattened.push('--' + key);
            if (typeof value != 'boolean') flattened.push(value);
          });
        });
      } else {
        flattened.push(arg);
      }
    }
  });
  return flattened;
}

module.exports.parse = parse;
module.exports.flatten = flatten;
