# Arguable [![Build Status](https://secure.travis-ci.org/bigeasy/arguable.png?branch=master)](http://travis-ci.org/bigeasy/arguable)

**Arguable** is a command line parser that lends structure to your command line
programs. You can use Arguable as a simple command line parser, or you can use
it to orgainze your program in a master program with any number of sub-commands
in the style of `git`, `apt-get` or `yum`.


**Arguable** starts with your usage message. It uses your usage message as the
declaration of the options. In essence, **Arguable** compels you to write a man
page in order to get your command line to parse.

```javascript
#!/usr/bin/node

/*

  usage: frobinate [options] [file...] [file]

  options:

  --help, -h                  display this message
  --processes, -p   [count]   number of processes to run in parallel

  description:

  frobinate will reticuatle the splines in all of your happy doodle
  files, optional in parallel. The `--processes` option is the number of
  processes to run concurrently, defaulting to zero.

*/

var options = require('arguable')(__filename);

if (options.help.boolean) options.help.usage(0);

options.processes 
       .default(1)
       .range(1, 16, "incorrect number of processes");

require('../lib/frobinator').frobinate(options.processes.integer, options.$argv);
```

**Arguable** starts with a full help mesage, because **Arguable** believes
that a full help message is important for a command line program.

**Arguable** is not fond of command line libraries that assemble a usage
message from snippets. It would rather have the author spend time composing a
nicely formatted usage message, with the ability to see the whole message,
then work from that message.

**Arguable** provides some helper functions for dealing with Windows.
**Arguable** will resolve UNIX file paths on Windows as if they were invoked
in a UNIX shell. That is, it will treat `*/*.t` as a file glob. If no files
are found, it will result in an error.

```
var arguable = require('arguable')
  , frobinator = require('frobinator')
  ;

// Convert a UNIX path to Windows, if we're on Windows.
arguable.resolve('t/test/example.t').forEach(function (path, files) {
  if (!files.length) arguable.error('file not found: ' + path);
  else frobinator(1, files);
});

// Convert a UNIX glob to a list of files Windows, if we're on Windows.
arguable.resolve('t/test/*.t').forEach(function (path, files) {
  if (!files.length) arguable.error('file not found: ' + path);
  else frobinator(1, files);
});
```

**Arguable** allows you to specify multiple commands.

```javascript
/*

  usage: frobinate run [options] [file...] [file]

  options:

  --help, -h                  display this message
  --processes, -p   [count]   number of processes to run in parallel

  description:

  frobinate will reticuatle the splines in all of your happy doodle
  files, optional in parallel. The `--processes` option is the number of
  processes to run concurrently, defaulting to zero.

  usage: frobinate compile [options] [file...] [file]

  options:

  --help, -h                  display this message
  --strict, -s                strict interpretation of the ISO 33465
                              Frobination Standard.
  --prefix, -p                prefix for frobination identifiers

  description:

  `frobinate compile` will accelerate frobination by compling it to
  intermediate output interpreted code (IOIC) then frobinating the hell
  out it.

*/

var options = require('arguable')(__filename)
  , frobinator = require('../lib/frobinator')
  ;

switch (options.$command) {
case 'compile':
  if (options.help.boolean) options.$usage(0);

  var ioic = frobinator.prepare(options.strict.boolean
                              , option.prefix.string, options.$argv);

  frobinator.frobinator(ioic);
  break;
case 'run':
  if (options.help.boolean) options.$usage(0);

  options.processes 
         .default(1)
         .range(1, 16, "incorrect number of processes");

  frobinator.frobinate(options.processes.integer, options.$argv);
  break;
default:
  options.$error('unknown command');
}
```

## Change Log

Changes for each release.

### Version 0.0.2 - Mon Jul  9 00:19:49 UTC 2012

 * Give matched file relative to base. #11.

### Version 0.0.1 - Sun Jul  8 23:29:58 UTC 2012

 * Created change log. #10.
 * Build on Travis CI. #9.
 * Bash wildcards on Windows. #7. #6. #5.

### Version 0.0.0 - Sun Jul  8 02:53:58 UTC 2012

 * Create README.md. #3. #2.
