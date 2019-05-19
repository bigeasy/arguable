function Path (path) {
    this.family = 'unix'
    this.path = path
}

Path.prototype.toString = function () {
    return this.path
}

Path.prototype.options = function (connect) {
    return { path: this.path, ...connect }
}

function Bindable (host, port) {
    this.family = 'IPv4'
    this.host = host
    this.port = port
}

Bindable.prototype.toString = function () {
    return this.host + ':' + this.port
}

Bindable.prototype.options = function (connect) {
    return { host: this.host, port: this.port, ...connect }
}

function isNumeric (value) {
    return !isNaN(parseFloat(value)) && isFinite(value)
}

// TODO IPv6.
function parse (value) {
    if (/^[.\/]/.test(value)) {
        return new Path(value)
    }
    var bind = value.split(':')
    if (bind.length == 1) {
        bind.unshift('0.0.0.0')
    }
// TODO You'll want string aliases so that `"foo is required" -> "generic required"
    if (!isNumeric(bind[1])) {
        return null
    }
    var parts = bind[0].split('.')
    if (parts.length != 4) {
        return null
    }
    if (parts.filter(function (part) {
        return isNumeric(part) && 0 <= +part && +part <= 255
    }).length != 4) {
        return null
    }
    var bind = value.split(':')
    if (bind.length == 1) {
        bind.unshift('0.0.0.0')
    }
    return new Bindable(bind[0], +bind[1])
}

module.exports = function (value, name) {
    value = String(value)
    value = parse(value)
    if (value == null) {
        throw '%s is not bindable'
    }
    return value
}
