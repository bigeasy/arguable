require('proof')(15, prove)

function prove (okay) {
    var bindable = require('../bindable')

    okay(bindable('/var/app/service.sock'), { family: 'unix', path: '/var/app/service.sock' }, 'path')
    okay(String(bindable('/var/app/service.sock')), '/var/app/service.sock', 'path to string')
    okay(bindable('8080'), { family: 'IPv4', address: '0.0.0.0', port: 8080 }, 'port')
    okay(String(bindable('8080')), '0.0.0.0:8080', 'to string')
    var converted = bindable('127.0.0.1:8080')
    okay(converted, { family: 'IPv4', address: '127.0.0.1', port: 8080 }, 'interface and port')
    okay(bindable(converted), { family: 'IPv4', address: '127.0.0.1', port: 8080 }, 'run over already converted bindable')
    try {
        bindable('X.0.0.1:8080')
    } catch (error) {
        okay(error, '%s is not bindable', 'part not numeric')
    }
    try {
        bindable('400.0.0.1:8080')
    } catch (error) {
        okay(error, '%s is not bindable', 'part out of range')
    }
    try {
        bindable('0.127.0.0.1:8080')
    } catch (error) {
        okay(error, '%s is not bindable', 'wrong number of parts')
    }
    try {
        console.log(bindable('X'))
    } catch (error) {
        okay(error, '%s is not bindable', 'port not numeric')
    }

    var binder

    binder = bindable('/var/app/service.sock')
    binder.listen({
        listen: function (path, backlog, callback) {
            okay({
                path: path,
                backlog: backlog,
                callback: typeof callback
            }, {
                path: '/var/app/service.sock',
                backlog: backlog,
                callback: 'function'
            }, 'path listen')
        }
    }, 255, function () {})
    okay(binder.connect({}), {
        path: '/var/app/service.sock'
    }, 'path connect')

    binder = bindable('10.0.0.1:8080')
    binder.listen({
        listen: function (port, iface, backlog, callback) {
            okay({
                port: port,
                iface: iface,
                backlog: backlog,
                callback: typeof callback
            }, {
                port: 8080,
                iface: '10.0.0.1',
                backlog: backlog,
                callback: 'function'
            }, 'network listen')
        }
    }, 255, function () {})
    okay(binder.connect({}), {
        hostname: '10.0.0.1',
        port: 8080
    }, 'network connect')
    binder = bindable('8080')
    okay(binder.connect({}), {
        hostname: '127.0.0.1',
        port: 8080
    }, 'network connect')
}
