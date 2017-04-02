require('proof')(8, prove)

function prove (assert) {
    var bindable = require('../bindable')

    assert(bindable('8080'), { address: '0.0.0.0', port: 8080 }, 'port')
    assert(String(bindable('8080')), '0.0.0.0:8080', 'to string')
    var converted = bindable('127.0.0.1:8080')
    assert(converted, { address: '127.0.0.1', port: 8080 }, 'interface and port')
    assert(bindable(converted), { address: '127.0.0.1', port: 8080 }, 'run over already converted bindable')
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
       bindable('X')
    } catch (error) {
        assert(error, '%s is not bindable', 'port not numeric')
    }
}
