function Bindable (address, port) {
    this.address = address
    this.port = port
}

Bindable.prototype.toString = function () {
    return this.address + ':' + this.port
}

function isNumeric (value) {
    return !isNaN(parseFloat(value)) && isFinite(value)
}

// TODO IPv6.
function isListen (value) {
    var bind = value.split(':')
    if (bind.length == 1) {
        bind.unshift('0.0.0.0')
    }
// TODO You'll want string aliases so that `"foo is required" -> "generic required"
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

module.exports = function (value, name) {
    value = String(value)
    if (!isListen(value)) {
        throw '%s is not bindable'
    }
    var bind = value.split(':')
    if (bind.length == 1) {
        bind.unshift('0.0.0.0')
    }
    return new Bindable(bind[0], +bind[1])
}
