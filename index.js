var slice = [].slice, path = require('path'), fs = require('fs');

function die () {
  console.log.apply(console, slice.call(arguments, 0));
  return process.exit(1);
}

const REGEX = new RegExp('(\\' + '/ . * + ? | ( ) [ ] { } \\'.split(' ').join('|\\') + ')', 'g');

function regular (text) { return text.replace(REGEX, '\\$1') }

function find (base, directory, pattern, index, found) {
  if (index == pattern.length) {
    found.push(path.relative(base, directory));
    return;
  }

  if (pattern[index]('.')) {
    find(base, directory, pattern, index + 1, found);
    return;
  }

  if (pattern[index]('..')) {
    find(base, path.dirname(directory), pattern, index + 1, found);
    return;
  }

  if (!fs.statSync(directory).isDirectory()) {
    return
  }

  fs.readdirSync(directory).forEach(function (file) {
    if (pattern[index](file)) {
      find(base, path.resolve(directory, file), pattern, index + 1, found);
    }
  });
}

function explode (pattern) {
  var exploded = [];
  pattern.split('/').forEach(function (unix) {
    unix.split('\\').forEach(function (part) {
      exploded.push(part);
    });
  });
  return exploded;
}

function alternation ($) {
  var regex = '(', $1;
  while ($1 = /^([^{}]*)([{}])(.*)$/.exec($[3])) {
    $ = $1;
    regex += $[1].split(',').map(function (alt) { return compile(alt) }).join('|');
    if ($[2] == '}') {
      regex += ')';
    } else {
      $ = alternation($);
      regex += $[1];
    }
  }
  $[1] = regex;
  return $;
}

function compile (glob) {
  var $, regex = '';
  while ($ = /^(.*?)(\*|\?|\[[^\]]+\]|{)(.*)$/.exec(glob)) {
    regex += regular($[1]);
    switch ($[2][0]) {
    case '*':
      regex += '.*'
      break;
    case '?':
      regex += '.'
      break;
    case '[':
      regex += $[2].replace(/^\[!/, '[^');
      break;
    case '{':
      $ = alternation($);
      regex += $[1];
      break;
    }
    glob = $[3];
  }
  return regex + regular(glob);
}

function glob (directory, argv) {
  var found = [];
  argv.forEach(function (pattern) {
    var exploded = explode(pattern), match;

    var compiled = exploded.map(function (part) {
      var regex;
      if (/^\.\.?$/.test(part)) {
        return function (file) { return file == part }
      }
      regex = new RegExp('^' + compile(part) + '$');
      return function (file) { return !/^\.\.?/.test(file) && regex.test(file) }
    });

    found.push(match = { path: pattern, files: [] });
    exploded = explode(directory);
    if (exploded[0] == '') exploded[0] = '/';
    var normalized = path.normalize(path.join.apply(path, exploded))
    find(normalized, normalized, compiled, 0, match.files);
  });
  return found;
}

const USAGE_RE = /^\s*___(?:\s+(\w+)\s+_)?\s+(usage|strings)(?::\s+((?:[a-z]{2}_[A-Z]{2})(?:\s+[a-z]{2}_[A-Z]{2})*))?\s+___\s*/;

function usage (lang, source, argv) {
  var lines = fs.readFileSync(source, 'utf8').split(/\r?\n/)
    , i = 0, j
    , I = lines.length
    , line
    , indent
    , $
    , candidate
    , defaultLanguage, language
    , message, command, match
    , langs
    ;

  OUTER: for (;i < I; i++) {
    if ($ = USAGE_RE.exec(lines[i])) {
      if (!$[3]) continue OUTER;
      langs = $[3].split(/\s+/);
      if ((!$[1] || $[1] == argv[0]) && (!defaultLanguage || ~langs.indexOf(lang))) {
        command = $[1];
        indent = /^(\s*)/.exec(lines[i])[1].length;
        for (j = i + 1; j < I; j++) {
          if (/\S/.test(lines[j])) {
            indent = Math.min(indent, /^(\s*)/.exec(lines[j])[1].length);
          }
          if ($ = USAGE_RE.exec(lines[j])) {
            if (!message) {
              message = lines.slice(i + 1, j).map(function (line) { return line.substring(indent) });
              language = { $usage: message };
              if (command) language.$command = command;
            } else {
              language.$errors = errors(lines.slice(i + 1, j));
            }
            if ($[2] == 'strings') {
              i = j;
              continue;
            }
            if (!defaultLanguage) defaultLanguage = language;
            if (~langs.indexOf(lang)) {
              language.defaultLanguage = defaultLanguage;
              return language 
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

  defaultLanguage.$defaultLanguage = defaultLanguage;
  return defaultLanguage;
}

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
  var vargs = slice.call(arguments, 0)
    , lang = 'en_US', source, argv, options
    , flags = {}
    , numeric = /^(count|number|value|size)$/
    , arg
    , arrayed = {}
    , pat = ''
    , $
    , main, errors, message
    , abended = function (usage, message) {
        if (message) console.log(message);
        console.log(usage);
      }
    ;
  if (typeof vargs[vargs.length - 2] == 'function') abended = vargs.pop();
  if (typeof vargs[vargs.length - 1] == 'function') main = vargs.pop();
  if (($ = /^(\w{2}_\w{2})(?:\.[\w\d-]+)?$/.exec(vargs[0])) && vargs.shift()) lang = $[1];
  source = vargs.shift(), argv = flatten(vargs), options = usage(lang, source, argv);
  options.$usage = options.$usage.map(function (line) {
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
  if (options.$command) {
    argv.shift();
  }
  try {
    getopt(pat, options, argv);
  } catch (e) {
    // TODO: I18n is missing from here.
    if (main) {
      console.error(e.message);
      console.error(options.$usage);
    } else {
      e.usage = options.$usage;
      throw e;
    }
  }
  options.$argv = argv;
  if (main) {
    try {
      main(options);
    } catch (e) {
      if (e.message == 'usage') {
        abended(options.$usage);
      } else if (message = (options.$errors[e.message] || options.$defaultLanguage.$errors[e.message])) {
        abended(options.$usage, message, e.arguments || []);
      } else {
        throw e;
      }
    }
  }
  return options;
}

function abend (message) {
  throw new Error(message);
}

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
        if ($[2] == '#' && isNaN(arg[2] = +arg[2])) abend("numeric option: " + arg[1]);
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
  opts.$given = Object.keys(given);
  return opts;
}

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

module.exports.glob = glob;
module.exports.parse = parse;
module.exports.flatten = flatten;
