# Arguable [![Build Status](https://secure.travis-ci.org/bigeasy/arguable.png?branch=master)](http://travis-ci.org/bigeasy/arguable)

**Arguable** is a command line parser that lends structure to your command line
programs. You can use Arguable as a simple command line parser, or you can use
it to organize your program in a master program with any number of sub-commands
in the style of `git`, `apt-get` or `yum`.

## Usage First

**Arguable** starts with your usage message. It extracts the program arguments
from the usage message. **Arguable** compels you to write a usage message in
order to get your command line to parse.

```javascript
#!/usr/bin/node

/*

  ___ usage: en_US ___
  usage: frobinate [options] [file...] [file]

  options:

  -h, --help                  display this message
  -p, --processes   [count]   number of processes to run in parallel

  description:

  frobinate will reticuatle the splines in all of your happy doodle
  files, optionally in parallel. The `--processes` option is the number
  of processes to run concurrently, defaulting to one.

  ___ usage ___

*/

require('arguable')(__filename, function (options) {
  if (options.help) throw new Error("usage");
  require('../lib/frobinator').frobinate(options.processes, options.$argv);
});
```

**Arguable** starts with a full help message, because **Arguable** believes that
a full help message is important for a command line program.

**Arguable** is not fond of command line libraries that assemble a usage message
from snippets. It would rather have the author spend time composing a nicely
formatted usage message, with the ability to see the whole message, then work
from that message.

## Cross-Platform Wildcard Patterns

Because one of the most common argument values is a file path, **Arguable**
provides some helper functions for dealing with paths Windows. **Arguable** can
resolve UNIX file paths on Windows as if they were invoked in a UNIX shell.
**Arguable** will convert the slashes and expand wildcards. That is, it will
treat `*/*.t` as a file glob.

```javascript
var arguable = require('arguable')
  , frobinator = require('frobinator')
  ;

arguable.glob(process.cwd(), [ 't/test/example.t', 't/test/*.t' ]).forEach(function (glob) {
  if (!glob.files.length) {
    throw new Error('file not found: ' + glob.pattern);
  } else {
    glob.files.forEach(function (file) {
      frobinator.frobinate(1, path.resolve(glob.base, file));
    });
  }
});
```

## Commands with Sub-Commands

**Arguable** allows you to specify sub-commands in the style of `git`, `apt-get`
or `yum`. Add the sub-command name to your usage description. **Arguable** will
select the correct help message based on the program arguments.

```javascript
/*

  ___ run _ usage: en_US ___
  usage: frobinate run [options] [file...] [file]

  options:

  -h, --help                  display this message
  -p, --processes     [count] number of processes to run in parallel

  description:

  frobinate will reticuatle the splines in all of your happy doodle
  files, optional in parallel. The `--processes` option is the number of
  processes to run concurrently, defaulting to zero.

  ___ compile _ usage: en_US ___
  usage: frobinate compile [options] [file...] [file]

  options:

  -h, --help                  display this message
  -s, --strict                strict interpretation of the ISO 33465
                              Frobination Standard.
  -p, --prefix                prefix for frobination identifiers

  description:

  `frobinate compile` will accelerate frobination by compling it to
  intermediate output interpreted code (IOIC) then frobinating the hell
  out it.

  ___ usage ___

*/

var arguable = require('arguable')
  , frobinator = require('../lib/frobinator')
  , icoc
  ;

arguable(__filename, function (options) {
  if (options.help) options.abend();
  switch (options.command) {
  case 'compile':
    ioic = frobinator.prepare(options.strict, option.prefix, options.$argv);
    frobinator.frobinator(ioic);
    break
  case 'run':
    frobinator.frobinate(options.processes, options.$argv);
    break;
  default:
    abend('unknown command', e.usage);
  }
});
```

## Internationalization

**Arguable** supports internationalization. Simply write additional usage
messages in other languages following the default language, marking the
additional languages with their locale string. You can then invoke the parser
passing the current locale string as the first argument.

```javascript

/*

___ usage: en_US ___
usage: awaken

  Good morning!
___ usage: fi_FI ___
käyttö: awaken

  Hyvää huomenta!
___ usage ___

*/

var parse = require('arguable').parse
  , options = parse(process.env.lang, __filename, []);

console.log(options.$usage);
```

We can run the above program with our `LANG` environment variable set to one of
teh supported langauges.

```console
$ LANG=fi_FI.UTF-8 node awaken.js
käyttö: awaken

  Hyvää huomenta!
```

The above will print the Finnish version of the help message. You can pass the
language specified in the users `LANG` environment variable directly to `parse`.
If no such language translation exists, it falls back to the first translation
encountered.

## Contributors

 * [Yawnt](https://github.com/yawnt) &mdash; Italian translation.
 * [Ville Lahdenvuo](https://github.com/tuhoojabotti) &mdash; Finnish
   translation.
 * [Ed Vielmetti](https://github.com/vielmetti) &mdash; German, Spanish,
   Portuguese, Japanese, Chinese translations.

## Change Log

Changes for each release.

### Version 0.0.7

Thu Feb 28 07:23:51 UTC 2013

 * Remove `defaultLanguage` from `params`. #33.
 * Error when usage message is missing. #28.

### Version 0.0.6

Thu Feb 21 07:42:25 UTC 2013
 
 * Fix formatting of change log in `README.md`. #31.
 * Create `Options` class. #32.
 * Implement sub-commands in usage markup. #30.
 * Add `.js` suffix to tests. #26.
 * Use markup for usage messages instead of guessing locale based on language. #27.
 * Wrap main body of program in a try/catch block. #25.

### Version 0.0.5

Tue Jul 10 19:02:23 UTC 2012

 * Update `README.md` help messages with short options first, proper termiator.
   #19.
 * Flatten arguments passed to parse. #18.
 * Internationalization. #8.
 * Add `$given`, a list of given parameters. #16.
 * Remove `sort` from flatten. #17.

### Version 0.0.4

Tue Jul 10 05:32:25 UTC 2012

 * Implement `flatten`. #15.
 * Use `:usage` to end usage message. #13.
 * Short opts before long opts in usage message list of options. #14.

### Version 0.0.3

Mon Jul  9 18:24:28 UTC 2012

 * Implement argument parsing. #4.

### Version 0.0.2

Mon Jul  9 00:19:49 UTC 2012

 * Give matched file relative to base. #11.

### Version 0.0.1

Sun Jul  8 23:29:58 UTC 2012

 * Created change log. #10.
 * Build on Travis CI. #9.
 * Bash wildcards on Windows. #7. #6. #5.

### Version 0.0.0

Sun Jul  8 02:53:58 UTC 2012

 * Create README.md. #3. #2.
