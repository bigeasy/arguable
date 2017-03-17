## Wed Mar 20 18:47:33 GMT 2013

Currently wondering what to do about missing commands. If the programmer
does not specify a default, what is the correct action to take? Nothing matches.
But it means that if the user specifies `frobinate foo` and there is no `foo`
command that the default is invoked.

I'm looking at `git` and seeing that there is no default command. If you invoke
the default command, you get a message saying that there is no such command.

Therefore, I believe there should always be a default command, and that the
validation for that command should attempt to report a missing command, if it is
at all able to detect it.

`svn` behaves the same way.

## Wed Mar 20 21:32:21 GMT 2013

### The `abended` function.

Currently, the user `abend` function handles the case of a programmer invoking
help by calling the `help` function of options. We use an exception to stop the
program, but that is an implementation detail. We then invoke the `abend`
function, which may be user supplied, and require that the user handle our help
message exception. This is confusing and needs to be removed. If the user wants
special help message handling, they can implement it themselves. They don't need
a framework for it.

This needs to be added to GitHub Issues.

## Fri Apr 19 17:16:08 GMT 2013

### String Resources

The string resources in the main module part are generally available to all
commands, so that subcommands can pull from a common pool of error messages and
resource strings.

### Internationalization

Make a note, somewhere in the documentation, that you're not supposed to change
the way the software works in a different language, but maybe you're allowed to,
but you really ought not to be allowed to. This means that the definition ought
to always be pulled from the default language.

Are there translations; can read from a directory, instead of from a file?

## Fri Apr 19 18:10:37 GMT 2013

### Inbox

This library migrated from generated code from a language that compiles into
JavaScript, so it is in rough shape, having been built from generated output.

As I document, and use the library, I'm going to probably find uses for this
current code base that are hidden by my distaste for the code, uses exposed by
the interface, which pleases me.

## Fri Aug  9 03:40:00 GMT 2013

### Markup Language

I'd like to make the input to arguable be more of a markup language, easier to
write, and it can create the nice columnar displays as optional outputs.

## Wed Aug 20 15:05:20 GMT 2014

You should use an error-first callback, providing a callback that will abend if
there is an error, but that does not need to be called to end the program.

## Sun Jan 17 17:51:25 GMT 2016

### Expanding Variables<a id="expand"></a>

Thoughts on less than simple implementation.

```
program.expand('bind', function (name, value, defaultAddress, defaultPort) {
    program.validate(/^(?:\d+(?:\.d+){3}:(\d+)|(\d+))$/.test(value), name + ' invalid bind')
    var split = value.split(':'), binding
    if (/^\d+$/.test(split[0])) {
        binding = {
            address: defaultAddress,
            port: +split[0]
        }
    } else if (split.length == 2) {
        binding =  {
            address: split[0],
            port: +split[1]
        }
    } else {
        binding = {
            address: split[0],
            port: defaultPort
        }
    }
    assert(validAddress(binding.address), name + ' invalid address')
    assert(validPort(binding.port), name + ' invalid port')
    return binding
}, '0.0.0.0', 8080)

```

This turns `program.param.bind` into a bidning object. It is a function you
provide to program, it is not built into program. Thus, in Node.js fashion you
can bundle up validations into modules, include them as needed.

Noticing that string matching for errors is getting a bit convoluted. Typing
"`--foo` is a required argument", "`--bar` is a required argument" is tedious to
read and maintain. Need some way to parameterize common arguments and either
match specifically or match generally.
