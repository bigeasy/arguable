var net = require('net')

module.exports = function (options) {
    return new net.Socket(options)
}
