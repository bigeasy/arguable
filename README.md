[![Stories in Ready](https://badge.waffle.io/bigeasy/arguable.png?label=ready&title=Ready)](https://waffle.io/bigeasy/arguable)
[![Build Status](https://travis-ci.org/bigeasy/arguable.svg?branch=master)](https://travis-ci.org/bigeasy/arguable) [![Coverage Status](https://coveralls.io/repos/bigeasy/arguable/badge.svg?branch=master&service=github)](https://coveralls.io/github/bigeasy/arguable?branch=master)

Usage first argument parser for Node.js.

**Arguable** is a command line parser that lends structure to your command line
programs. You can use Arguable as a simple command line parser, or you can use
it to organize your program in a master program with any number of sub-commands
in the style of `git`, `apt-get` or `yum`.

## Usage First

**Arguable** starts with your usage message. It extracts the program arguments
from the usage message. **Arguable** compels you to write a usage message in
order to get your command line to parse.

```javascript
#!/usr/bin/env node

/*

  ___ usage ___ en_US ___
  usage: frobinate [options] [file...] [file]

  options:

  -h, --help                  display this message
  -p, --processes   [count]   number of processes to run in parallel

  description:

  frobinate will reticuatle the splines in all of your transmogrifier
  files, optionally in parallel. The `--processes` option is the number
  of processes to run concurrently, defaulting to one.

  ___ . ___

*/

var frobinate = require('../lib/frobinator').frobinate

require('arguable')(module, function (program, callback) {
    program.helpIf(program.param.help)
    frobinate(program.param.processes, .param.argv, callback)
})
```

In the spirit of opinionated software **Arguable** starts with a full help
message, because I believe that a full usage message is important for a command
line program.

Usage messages are important to Node.js; Linux users have become accustomed to
having a lot of context at their disposal when they invoke `--help`. Windows
users are without a decent manual page system, so they tend to rely on usage
messages to discover what their software can do.

I don't want my command line library to assemble a usage message from a method
chained, declarative API. The usage message and arguments of a command line
program are the user interface. I do not expect its implementation to be
trivial. I do not want to delegate the details to a module.

It would rather have spend time composing a nicely formatted usage message, with
the ability to see the whole message, then work from that message.

## Anatomy of a Usage Message

Your usage message must contain a long option for every option; short options
are optional.

If you have a synonym for one of your commands, simply declare it separately and
document it separately.

The only argument validation that *Arguable** performs is to check that
arguments that accept a parameter have a parameter; that arguments that don't
accept a parameter don't have a parameter. Type checking is meant to be
performed by the program itself.

```javascript
#!/usr/bin/env node

/*

  ___ usage ___ en_US ___
  usage: frobinate [options] [file...] [file]

  options:

  -h, --help                  display this message
  -p, --processes   [count]   number of processes to run in parallel
  -t, --threads     [count]   same as `--proceses`
  -v, --verbose               toggle verbose output

  description:

  frobinate will reticuatle the splines in all of your transmogrifier
  files, optionally in parallel. The `--processes` option is the number
  of processes to run concurrently, defaulting to one.

  ___ . ___

*/

require('arguable')(module, function (program, callback) {
  program.helpIf(program.param.help)
  var processes = options.processes || options.threads || 1
  frobinate(processes, program.param.verbose, program.argv, callback)
});
```

*Ed: Add an example of type checking &mdash; integer &mdash; to the example
above.*

*Ed: The error checking example would also show how to report errors.*

## Commands with Sub-Commands

**Arguable** allows you to specify sub-commands in the style of `git`, `apt-get`
or `yum`. Add the sub-command name to your usage description. **Arguable** will
select the correct help message based on the program arguments.

```javascript
/*

  ___ run, usage ___ en_US ___
  usage: frobinate run [options] [file...] [file]

  options:

  -h, --help                  display this message
  -p, --processes     [count] number of processes to run in parallel

  description:

  frobinate will reticuatle the splines in all of your transmogrifier
  files, optional in parallel. The `--processes` option is the number of
  processes to run concurrently, defaulting to zero.

  ___ compile, usage ___ en_US ___
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

  ___ . ___

*/

var arguable = require('arguable')
  , frobinator = require('../lib/frobinator')
  , icoc
  ;

require('arguable')(module, function (program, callback) {
    program.helpIf(program.param.help)
    switch (program.command) {
    case 'compile':
        ioic = frobinator.prepare(program.param.strict, program.param.prefix, program.argv)
        frobinator.frobinator(ioic, callback)
        break
    case 'run':
        frobinator.frobinate(program.param.processes, program.argv, callback)
        break
    default:
        program.abend('unknown command')
  }
})
```

## Internationalization

**Arguable** supports internationalization. Simply write additional usage
messages in other languages following the default language, marking the
additional languages with their locale string. You can then invoke the parser
passing the current locale string as the first argument.

```javascript

/*

___ usage ___ en_US ___
usage: awaken

  Good morning!
___ usage ___ fi_FI ___
käyttö: awaken

  Hyvää huomenta!
___ . ___

*/

require('arguable')(module, function (program, callback) {
    console.log(program.usage)
    callback()
})
```

We can run the above program with our `LANG` environment variable set to one of
the supported languages.

```console
$ LANG=fi_FI.UTF-8 node awaken.js
käyttö: awaken

  Hyvää huomenta!
```

The above will print the Finnish version of the help message. You can pass the
language specified in the users `LANG` environment variable directly to `parse`.
If no such language translation exists, it falls back to the first translation
encountered.

Note that command names and switches are not internationalized. Changing the
user's language preferences is not supposed change the program interface.

## Error Messages

You can define internationalized error messages. Add a `strings` section to
following your usage defintion

```javascript
#!/usr/bin/env node

/*

  ___ usage: en_US ___
  usage: frobinate [options] [file...] [file]

  options:

  -h, --help                  display this message
  -p, --processes   [count]   number of processes to run in parallel

  description:

  frobinate will reticuatle the splines in all of your transmogrifier
  files, optionally in parallel. The `--processes` option is the number
  of processes to run concurrently, defaulting to one. Note that you
  cannot run more than four processes at time.

  ___ strings ___

    too many processes:
      You choose %d processes to frobinate %s, but the maximum is 4.

  ___ usage ___

*/

require('arguable')(__filename, function (options) {
  if (options.help) throw new Error("usage");
  if (options.processes > 4) {
    options.abend('too many processes', options.processes, options.argv[0]);
  }
  require('../lib/frobinator').frobinate(options.processes, options.argv);
});
```

Arguments are fed to `util.format` and the result is printed in your language
message to standard out.

Each language can have it's own message section. Your translation might need to
reorder the arguments to fit a different sentence structure. Here's an example
of reordering, however we're still in English, because it's really all I know.

Oh, I'd love a patch if you have an example in your language, and your language
is not English.

```javascript
#!/usr/bin/node

/*

  ___ usage ___ en_US ___
  usage: frobinate [options] [file...] [file]

  options:

  -h, --help                  display this message
  -p, --processes   [count]   number of processes to run in parallel

  description:

  frobinate will reticuatle the splines in all of your transmogrifier
  files, optionally in parallel. The `--processes` option is the number
  of processes to run concurrently, defaulting to one. Note that you
  cannot run more than four processes at time.

  ___ $ ___

    too many processes (2, 1):
      You choose frobinate %s using %d processes, but the maximum is 4.

  ___ . ___

*/

require('arguable')(module, function (program, callback) {
    program.helpIf(program.param.help)
    if (program.param..processes > 4) {
        program.abend('too many processes', program.param.processes, options.argv[0])
    }
    require('../lib/frobinator').frobinate(program.param.processes, program.argv, callback)
})
```

## Contributors

 * [Yawnt](https://github.com/yawnt) &mdash; Italian translation.
 * [Ville Lahdenvuo](https://github.com/tuhoojabotti) &mdash; Finnish
   translation.
 * [Ed Vielmetti](https://github.com/vielmetti) &mdash; German, Spanish,
   Portuguese, Japanese, Chinese translations.

## Change Log

*todo: Move this into GitHub Releases!*

Changes for each release.

 * Upgrade Proof to 0.0.32. #54.

### Version 0.0.9

Sun Jun 30 14:57:25 UTC 2013

 * Implement `options.fatal`. #52.
 * Upgrade to Proof 0.0.30. #51. #50.
 * Use `parseFloat` to parse numeric. #41.
 * Fix variable leaked into global namespace. #49.
 * Provide format to `abended` function. #35.
 * Make string resources generally available. #43.
 * Tidy, delete dead code. #43. #35.
 * Add coverage chicklet to `README.md`.
 * Remove `bc` install from Travis CI build.
 * Remove `.npmignore`. #47.

### Version 0.0.8

Thu Mar 21 05:26:43 UTC 2013

 * Use a usage message for parse errors. #44.
 * Pass `Error` to user provided abnormal exit callback. #45.
 * Make no matching usage a plain old exception. #46.
 * Begin a design diary.
 * Add an MIT `LICENSE` and a contribution guide.
 * Rename `errors` function to `strings`. #42.
 * Reorder and format error messages. #29.
 * Drop support for Node.js 0.6.
 * Fix and test `Options.help`. #38.
 * Use `Options.abend` in arguments parser. #36.
 * Complete internal conversion to an `Options` class.
 * Extract globs into an [expandable](https://github.com/bigeasy/expandable)
   project. #37.

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

 * Update `README.md` help messages with short options first, proper terminator. #19.
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
