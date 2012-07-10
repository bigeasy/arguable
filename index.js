var slice = [].slice, path = require('path'), fs = require('fs');

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

function usage (source, argv) {
  var lines = fs.readFileSync(source, 'utf8').split(/\r?\n/)
    , i = 0, j
    , I = lines.length
    , line
    , indent
    , $
    ;

  for (;i < I; i++) {
    if ($ = /^\s*usage:\s+(\w[-\w\d_]*)(?:\s+(\w+[-\w\d_]*))?/.exec(lines[i])) {
      if (!$[2] || $[2] == argv[0]) {
        indent = /^(\s*)/.exec(lines[i])[1].length;
        for (j = i + 1; j < I; j++) {
          if (/\S/.test(lines[j])) {
            indent = Math.min(indent, /^(\s*)/.exec(lines[j])[1].length);
          }
          if (/^\s*(usage:|--- arguable ---)/.test(lines[j])) {
            return {
              $usage: lines.slice(i, j).map(function (line) { return line.substring(indent) })
            , $command: $[2]
            }
          }
        }
        return null;
      }
    }
  }

  return null;
}

function parse (source, argv) {
  var options = usage(source, argv)
    , flags = {}
    , numeric = /^(count|number|value|size)$/
    , arg
    , arrayed = {}
    , pat = ''
    ;
  argv = argv.slice(0);
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
  var arg, i = 0, $, arg, opt, l, alts;
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
    if ($[1] == '@') opts[opt].push(arg[2]);
    else if (opts[opt] != null) abend("option can only be secified once: " + arg[1]);
    else opts[opt] = arg[2];
  }
  return opts;
}

module.exports.glob = glob;
module.exports.parse = parse;
