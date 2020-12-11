const util = require('util')

const coalesce = require('extant')
const Interrupt = require('interrupt')

const getopt = require('./getopt')

// This will never be pretty. Let it be ugly. Let it swallow all the sins before
// they enter your program, so that your program can be a garden of pure
// ideology.

//
class Arguable {
    static Error = Interrupt.create('Arguable.Error', {
        ABEND: 'user initiated an early exit'
    })

    constructor (usage, argv, options) {
        this._usage = usage

        // These are the merged defintion and invocation options provided by the
        // user.
        this.options = options.options

        // We'll use this for an exit code if it is set and if we exit normally.
        this.exitCode = null

        // Are we running as a main module?
        this.isMainModule = options.isMainModule

        // Use environment `LANG` or else language of first usage definition.
        this.lang = coalesce(options.lang, this._usage.language)

        // Extract argument patterns from usage.
        const patterns = this._usage.getPattern()

        // Extract the arguments that accept values, TODO maybe call `valuable`.
        this.valuable = patterns.filter(function (pattern) {
            return pattern.valuable
        }).map(function (pattern) {
            return pattern.verbose
        })

        // Parse arguments and save the remaining arguments.
        try {
            var gotopts = getopt(patterns, argv)
        } catch (error) {
            this.abend(error.abend, error.context)
        }

        // Extract an argument end sigil and note that it was there.
        if (this.terminator = argv[0] == '--')  {
            argv.shift()
        }

        // Slice and dice results into convenience structures.
        this._setParameters(gotopts)

        // Remaining arguments.
        this.argv = argv

        // Assign standard I/O provide in `options`.
        this.stdout = options.stdout
        this.stderr = options.stderr
        this.stdin = options.stdin

        // Assign pipes open to our parent.
        this.pipes = options.pipes
    }

    // Use an array of key/value pairs to populate some useful shortcut properties
    // for working with parameters.
    //
    // Note to self; we use `parameters` here and in documentation because
    // `arguments` is a JavaScript reserved word.

    //
    _setParameters (parameters) {
        this.parameters = parameters
        this.given = parameters.map(function (parameter) {
            return parameter.name
        }).filter(function (value, index, arrayj) {
            return arrayj.indexOf(value) == index
        })
        this.arrayed = {}
        this.valuable.forEach(function (name) {
            this.arrayed[name] = []
        }, this)
        this.parameters.forEach(function (parameter) {
            let group = this.arrayed[parameter.name]
            if (group == null) {
                group = this.arrayed[parameter.name] = []
            }
            group.push(parameter.value)
        }, this)
        this.ultimate = {}
        this.given.forEach((key) => {
            if (~this.valuable.indexOf(key)) {
                this.ultimate[key] = this.arrayed[key][this.arrayed[key].length - 1]
            } else {
                this.ultimate[key] = this.arrayed[key].reduce((toggle, value) => {
                    if (!value) {
                        return value
                    }
                    return ! toggle
                }, false)
            }
        })
    }

    // Assert that there is a value present for a required argument.
    required () {
        for (let i = 0, I = arguments.length; i < I; i++) {
            if (!(arguments[i] in this.ultimate)) {
                this.abend(arguments[i] + ' is required')
            }
        }
    }

    // Variadic nonsense to support handful of different ways to invoke this
    // validation function. The validation can change the type and value of the
    // parameters in the in the parameters array, so valiation is also
    // transmogrifcation of strings into appropriately typed and structured
    // parameters for your program.
    validate (...vargs) {
        let validator = null
        const type = typeof vargs[0]
        if (type == 'string' && ~vargs[0].indexOf('%s')) {
            const format = vargs.shift()
            const test = vargs.pop()
            const valid = test instanceof RegExp ? function (value) {
                return test.test(value)
            } : test
            // The validator will throw a format to use to format the error message.
            // Not sure why I've decied to get so wicked with the throws.
            validator = function (value) {
                if (!valid(value)) {
                    throw format
                }
            }
        } else if (type == 'function') {
            validator = vargs.shift()
        } else {
            validator = vargs.pop()
        }
        const parameters = this.parameters.map(function (parameter) {
            try {
                if (!~vargs.indexOf(parameter.name)) {
                    return parameter
                }
                const value = validator(parameter.value, parameter.name, this)
                if (value !== (void(0))) {
                    parameter.value = value
                }
                return parameter
            } catch (error) {
                if (!(typeof error == 'string' && ~error.indexOf('%s'))) {
                    throw error
                }
                this.abend(util.format(error, parameter.name), parameter.value, parameter.name)
            }
        }.bind(this))
        this._setParameters(parameters)
    }

    // Format a message using the string tables provided in the usage message.
    format (key, ...vargs) {
        return this._usage.format(this.lang, key, vargs)
    }

    // abend helper stops execution and prints a message
    abend (key, ...vargs) {
        let exitCode = 1
        if (typeof key == 'number') {
            exitCode = key
            key = vargs.shift()
        }
        let message = null
        if (key) {
            message = this._usage.format(this.lang, key, vargs)
        }
        this._redirect = 'stderr'
        throw new Arguable.Error('ABEND', {
            method: 'abend',
            key: key,
            vargs: vargs,
            stderr: message,
            exitCode: exitCode
        })
    }

    // Stop execution and print help message.
    help () {
        throw new Arguable.Error('ABEND', {
            method: 'help',
            stdout: this._usage.chooseUsage(this.lang),
            exitCode: 0
        })
    }

    // Assert the given condition is true or else abend with the given abend
    // arguments.
    assert (condition) {
        if (!condition) {
            const vargs = []
            vargs.push.apply(vargs, arguments)
            this.abend.apply(this, vargs.slice(1))
        }
    }

    // Saves having to write a unit test for every application that checks a branch
    // that does exactly this.
    helpIf (help) {
        if (help) this.help()
    }

    // Load an arguable module and invoke it using this `Program` as the parent. Not
    // at all certain that I want to have all this formatting nonsense. Can't the
    // parent simply invoke it with a string?
    //
    // Look up a delegate module and raise an exception if it is not found.

    //
    delegate (require, format, command) {
        const pkg = util.format(format, command)
        try {
            return require(pkg)
        } catch (error) {
            if (error.code == 'MODULE_NOT_FOUND') {
                this.abend('sub command module not found', command, pkg, format)
            } else {
                throw error
            }
        }
    }
}

// Export `Arugable`.
module.exports = Arguable
