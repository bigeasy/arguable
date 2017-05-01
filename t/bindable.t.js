require('proof')(12, prove)

function prove (assert) {
    var bindable = require('../bindable')

    assert(bindable('/var/app/service.sock'), { family: 'unix', path: '/var/app/service.sock' }, 'path')
    assert(String(bindable('/var/app/service.sock')), '/var/app/service.sock', 'path to string')
    assert(bindable('8080'), { family: 'IPv4', address: '0.0.0.0', port: 8080 }, 'port')
    assert(String(bindable('8080')), '0.0.0.0:8080', 'to string')
    var converted = bindable('127.0.0.1:8080')
    assert(converted, { family: 'IPv4', address: '127.0.0.1', port: 8080 }, 'interface and port')
    assert(bindable(converted), { family: 'IPv4', address: '127.0.0.1', port: 8080 }, 'run over already converted bindable')
    try {
       bindable('X.0.0.1:8080')
    } catch (error) {
        assert(error, '%s is not bindable', 'part not numeric')
    }
    try {
       bindable('400.0.0.1:8080')
    } catch (error) {
        assert(error, '%s is not bindable', 'part out of range')
    }
    try {
       bindable('0.127.0.0.1:8080')
    } catch (error) {
        assert(error, '%s is not bindable', 'wrong number of parts')
    }
    try {
       console.log(bindable('X'))
    } catch (error) {
        assert(error, '%s is not bindable', 'port not numeric')
    }

    var binder

    binder = bindable('/var/app/service.sock')
    binder.listen({
        listen: function (path, backlog, callback) {
            assert({
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

    binder = bindable('127.0.0.1:8080')
    binder.listen({
        listen: function (port, iface, backlog, callback) {
            assert({
                port: port,
                iface: iface,
                backlog: backlog,
                callback: typeof callback
            }, {
                port: 8080,
                iface: '127.0.0.1',
                backlog: backlog,
                callback: 'function'
            }, 'network listen')
        }
    }, 255, function () {})
}
