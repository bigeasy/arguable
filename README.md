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
  --- arguable ---

*/

var options;

try {
  options = require('arguable')(__filename);
} catch (e) {
  console.error('error: ' + e.message);
  console.error(e.usage);
  process.exit(1);
}

if (options.help) {
  conosle.log(options.$usage);
} else {
  require('../lib/frobinator').frobinate(options.processes, options.$argv);
}
```

**Arguable** starts with a full help mesage, because **Arguable** believes that
a full help message is important for a command line program.

**Arguable** is not fond of command line libraries that assemble a usage message
from snippets. It would rather have the author spend time composing a nicely
formatted usage message, with the ability to see the whole message, then work
from that message.

Because one of the most common arguent values is a file path, **Arguable**
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

  --- arguable ---

*/

var options = require('arguable')(__filename)
  , frobinator = require('../lib/frobinator')
  , icoc
  ;

function abend (message, usage) {
  console.error('error: ' + message);
  console.error(usage);
  process.exit(1);
}

try {
  options = require('arguable')(__filename);
} catch (e) {
  abend(e.message, e.usage);
}

if (options.help) {
  console.log(options.$usage);
} else {
  switch (options.$command) {
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
}
```

## Change Log

Changes for each release.

### Version 0.0.4 - Tue Jul 10 05:32:25 UTC 2012

 * Implement `flatten`. #15.
 * Use `:usage` to end usage message. #13.
 * Short opts before long opts in usage message list of options. #14.

### Version 0.0.3 - Mon Jul  9 18:24:28 UTC 2012

 * Implement argument parsing. #4.

### Version 0.0.2 - Mon Jul  9 00:19:49 UTC 2012

 * Give matched file relative to base. #11.

### Version 0.0.1 - Sun Jul  8 23:29:58 UTC 2012

 * Created change log. #10.
 * Build on Travis CI. #9.
 * Bash wildcards on Windows. #7. #6. #5.

### Version 0.0.0 - Sun Jul  8 02:53:58 UTC 2012

 * Create README.md. #3. #2.
