var abend = require('abend')

module.exports = function (module, process, f, options) {
    if (module === process.mainModule) {
        f(options, abend)
    }
}
