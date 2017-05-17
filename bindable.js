function Path (path) {
    this.family = 'unix'
    this.path = path
}

Path.prototype.toString = function () {
    return this.path
}

Path.prototype.listen = function () {
    var vargs = Array.prototype.slice.call(arguments)
    var server = vargs.shift()
    vargs.unshift(this.path)
    server.listen.apply(server, vargs)
}

Path.prototype.connect = function (connect) {
    connect.path = this.path
    return connect
}

function Bindable (address, port) {
    this.family = 'IPv4'
    this.address = address
    this.port = port
}

Bindable.prototype.toString = function () {
    return this.address + ':' + this.port
}

Bindable.prototype.listen = function () {
    var vargs = Array.prototype.slice.call(arguments)
    var server = vargs.shift()
    vargs.unshift(this.port, this.address)
    server.listen.apply(server, vargs)
}

Bindable.prototype.connect = function (connect) {
    connect.port = this.port
    connect.hostname = this.address == '0.0.0.0' ? '127.0.0.1' : this.address
    return connect
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
