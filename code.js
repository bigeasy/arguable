var assert = require('assert')

module.exports = function (process) {
    var version = process.versions.node.split('.').map(Number)
    if (version[0] == 0 && version[1] < 11 || (version[1] == 11 && version[2] < 8)) {
        var listeners = process.listeners('exit')
        process.removeAllListeners('exit')
        process.on('exit', exit)
        listeners.forEach(function (listener) { process.on('exit', listener) })
    }
    function exit (exitCode) {
        assert(exitCode != null, 'null exit code')
        if (!('exitCode' in process)) {
            process.exitCode = exitCode
        }
        var listeners = process.listeners('exit'), invoke = false, listener
        do {
            listener = listeners.shift()
            assert(listener != null, 'cannot find exit patch listener')
        } while (listener !== exit)
        while (listeners.length) {
            listeners.shift().call(null, process.exitCode)
        }
        process.exit(process.exitCode)
    }
}
