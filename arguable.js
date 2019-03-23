var cadence = require('cadence')
var createUsage = require('./usage')
var assert = require('assert')
var getopt = require('./getopt')
var util = require('util')
var slice = [].slice
var Interrupt = require('interrupt').createInterrupter('bigeasy.arguable')
var rescue = require('rescue')
var Signal = require('signal')

// This will never be pretty. Let it be ugly. Let it swallow all the sins before
// they enter your program, so that your program can be a garden of pure
// ideology.

//
function Arguable (source, argv, options) {
    this._usage = createUsage(source)

    // As opposed to being the actual `Process` object it mocks.
    this.isArguable = true

    // Capture environment.
    this.env = options.env
    this.isMainModule = options.isMainModule
    this._process = options.events
    this.attributes = {}
    this.options = options.options

    // Use environment `LANG` or else language of first usage definition.
    this.lang = this.env.LANG ? this.env.LANG.split('.')[0] : this._usage.language

    this.path = []

    // Extract argument patterns from usage.
    var patterns = this._usage.getPattern()
    this.arguable = patterns.filter(function (pattern) {
        return pattern.arguable
    }).map(function (pattern) {
        return pattern.verbose
    })

    // Parse arguments and save the remaining arguments.
    try {
        var gotopts = getopt(patterns, argv)
    } catch (error) {
        this.abend(error.abend, error.context)
    }

    if (this.terminal = argv[0] == '--')  {
        argv.shift()
    }

    this._setParameters(gotopts)

    this.argv = argv

    // Assign I/O provide in `options`.
    this.stdout = options.stdout
    this.stderr = options.stderr
    this.stdin = options.stdin
    this.send = options.send

    this.pid = process.pid
    this.platform = process.platform
    this.release = process.release

    this.ready = options.ready || new Signal
}

// Use an array of key/value pairs to populate some useful shortcut properties
// for working with parameters.
//
// Note to self; we use `parameters` here and in documentation because
// `arguments` is a JavaScript reserved word.

//
Arguable.prototype._setParameters = function (parameters) {
    this.parameters = parameters
    this.given = parameters.map(function (parameter) {
        return parameter.name
    }).filter(function (value, index, arrayj) {
        return arrayj.indexOf(value) == index
    })
    this.arrayed = {}
    this.arguable.forEach(function (name) {
        this.arrayed[name] = []
    }, this)
    this.parameters.forEach(function (parameter) {
        var group = this.arrayed[parameter.name]
        if (group == null) {
            group = this.arrayed[parameter.name] = []
        }
        group.push(parameter.value)
    }, this)
    this.ultimate = {}
    this.given.forEach(function (key) {
        this.ultimate[key] = this.arrayed[key][this.arrayed[key].length - 1]
    }, this)
}

// Assert that there is a value present for a required argument.
Arguable.prototype.required = function () {
    slice.call(arguments).forEach(function (name) {
        if (!(name in this.ultimate)) {
            this.abend(name + ' is required')
        }
    }, this)
}

// Variadic nonsense to support handful of different ways to invoke this
// validation function. The validation can change the type and value of the
// parameters in the in the parameters array, so valiation is also
// transmogrifcation of strings into appropriately typed and structured
// parameters for your program.
Arguable.prototype.validate = function () {
    var vargs = slice.call(arguments)
    var validator = null
    var type = typeof vargs[0]
    if (type == 'string' && ~vargs[0].indexOf('%s')) {
        var format = vargs.shift()
        var test = vargs.pop()
        var valid = test instanceof RegExp ? function (value) {
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
    var parameters = this.parameters.map(function (parameter) {
        try {
            if (!~vargs.indexOf(parameter.name)) {
                return parameter
            }
            var value = validator(parameter.value, parameter.name, this)
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
Arguable.prototype.format = function (key) {
    return this._usage.format(this.lang, key, slice.call(arguments, 1))
}

// abend helper stops execution and prints a message
Arguable.prototype.abend = function () {
    var vargs = slice.call(arguments), key = vargs.shift(), exitCode = 1
    if (typeof key == 'number') {
        exitCode = key
        key = vargs.shift()
    }
    var message
    if (key) {
        message = this._usage.format(this.lang, key, vargs)
    }
    this._redirect = 'stderr'
    throw new Interrupt('abend', {
        method: 'abend',
        key: key,
        vargs: vargs,
        stderr: message,
        exitCode: exitCode
    })
}

// Stop execution and print help message.
Arguable.prototype.help = function () {
    throw new Interrupt('help', {
        method: 'help',
        stdout: this._usage.chooseUsage(this.lang),
        exitCode: 0
    })
}

Arguable.prototype.assert = function (condition, message) {
    if (!condition) this.abend(message)
}

Arguable.prototype.attempt = function (f) {
    try {
        return f()
    } catch (error) {
        var vargs = slice.call(arguments, 1)
        var abend = function () {
            this.abend.apply(this, vargs)
        }.bind(this)
        if (vargs[0] instanceof RegExp) {
            rescue(vargs.shift(), abend)(error)
        } else {
            abend()
        }
    }
}

// Saves having to write a unit test for every application that checks a branch
// that does exactly this.
Arguable.prototype.helpIf = function (help) {
    if (help) this.help()
}

// Load an arguable module and invoke it using this `Program` as the parent. Not
// at all certain that I want to have all this formatting nonsense. Can't the
// parent simply invoke it with a string?
//
// We're only going to support accepting a package name, but leave the
// formatting logic in for now to see where it's being used.
Arguable.prototype.delegate = cadence(function (async, require, pkg, argv) {
    var program
    try {
        program = require(pkg)
    } catch (error) {
        if (error.code == 'MODULE_NOT_FOUND') {
            this.abend('sub command module not found', pkg)
        } else {
            throw error
        }
    }
    program(argv, {
        $stdout: this.stdout,
        $stdin: this.stdin,
        $stderr: this.stderr
    }, async())
})

module.exports = Arguable
