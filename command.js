var slice = [].slice
var util = require('util')

function isNumeric (n) { return !isNaN(parseFloat(n)) && isFinite(n) }

// TODO IPv6.
function isListen (value) {
    var bind = value.split(':')
    if (bind.length == 1) {
        bind.unshift('0.0.0.0')
    }
    if (isNumeric(bind[1])) {
        var parts = bind[0].split('.')
        if (parts.length == 4) {
            return parts.filter(function (part) {
                return isNumeric(part) && 0 <= +part && +part <= 255
            }).length == 4
        }
    }
    return false
}

function Command (program, name, gotopts) {
    this.program = program
    this.name = name
    this.given = gotopts.given
    this.params = gotopts.params
    this.ordered = gotopts.ordered
    this.terminal = gotopts.terminal
    this.param = {}
    this.given.forEach(function (key) {
        this.param[key] = this.params[key][this.params[key].length - 1]
    }, this)
}

Command.prototype.required = function () {
    slice.call(arguments).forEach(function (param) {
        if (!(param in this.param)) {
            this.program.abend(param + ' is required')
        }
    }, this)
}

Command.prototype.numeric = function () {
    this.validate.apply(this, [ '%s is not numeric' ].concat(slice.call(arguments))
                                                     .concat(isNumeric))
}

Command.prototype.bind = function (name) {
    this.validate('%s is not bindable', name, isListen)
    var bind = this.param[name].split(':')
    if (bind.length == 1) {
        bind.unshift('0.0.0.0')
    }
    return { address: bind[0], port: +bind[1] }
}

Command.prototype.validate = function () {
    var vargs = slice.call(arguments)
    var format = vargs.shift()
    var test = vargs.pop()
    var f = test instanceof RegExp ? function (value) {
        return test.test(value)
    } : test
    vargs.forEach(function (param) {
        if ((param in this.param) && !f(this.param[param])) {
            this.program.abend(util.format(format, param))
        }
    }, this)
}

module.exports = Command
