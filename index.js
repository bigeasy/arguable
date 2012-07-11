var slice = [].slice, path = require('path'), fs = require('fs');

const REGEX = new RegExp('(\\' + '/ . * + ? | ( ) [ ] { } \\'.split(' ').join('|\\') + ')', 'g');

const LANG =
{ de_DE: 'Benutzung'
, en_GB: 'usage'
, en_US: 'usage'
, es_ES: 'uso'
, fi_FI: 'käyttö'
, ja_JP: '使用法'
, it_IT: 'utilizzo'
, pt_BR: 'uso'
, pt_PT: 'uso'
, zh_CH: '用法'
};

const DISAMBIGUATE =
{ en_ES: /(opciones:|descripción:)/
, pt_BR: /(opções:|descrição:)/
, pt_PT: /(opções:|descrição:)/
}

const USAGES = '(?:' + Object.keys(LANG).map(function (key) { return LANG[key] }).join('|') + ')';
const START_USAGE_RE = new RegExp('^\\s*(' + USAGES + '):\\s+(?:\\w[-\\w\\d_]*)(?:\\s+(\\w+[-\\w\\d_]*))?');
const END_USAGE_RE = new RegExp('^\\s*(?:' + USAGES + ':|:' + USAGES + ')');

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

function usage (lang, source, argv) {
  var lines = fs.readFileSync(source, 'utf8').split(/\r?\n/)
    , i = 0, j
    , I = lines.length
    , line
    , indent
    , $
    , candidate
    , message, match
    ;

  OUTER: for (;i < I; i++) {
    if ($ = START_USAGE_RE.exec(lines[i])) {
      if ((!candidate || LANG[lang] == $[1]) && (!$[2] || ($[2] == argv[0] && argv.shift()))) {
        indent = /^(\s*)/.exec(lines[i])[1].length;
        for (j = i + 1; j < I; j++) {
          if (/\S/.test(lines[j])) {
            indent = Math.min(indent, /^(\s*)/.exec(lines[j])[1].length);
          }
          if (END_USAGE_RE.test(lines[j])) {
            message = lines.slice(i, j).map(function (line) { return line.substring(indent) });
            match = (LANG[lang] == $[1] && (DISAMBIGUATE[lang] || /./).test(message))
            if (!candidate || match) {
              candidate =
              { $usage: message
              , $command: $[2]
              }
              if (match) break OUTER;
            }
            i = j - 1;
            continue OUTER;
          }
        }
        return null;
      }
    }
  }

  return candidate;
}

function parse () {
  var vargs = slice.call(arguments, 0)
    , lang = 'en_US', source, argv, options
    , flags = {}
    , numeric = /^(count|number|value|size)$/
    , arg
    , arrayed = {}
    , pat = ''
    , $
    ;
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
  try {
    getopt(pat, options, argv);
  } catch (e) {
    e.usage = options.$usage;
    throw e;
  }
  options.$argv = argv;
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
