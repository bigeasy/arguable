describe('bindable', () => {
    const assert = require('assert')
    const bindable = require('../bindable')

    function json (object) {
        return JSON.parse(JSON.stringify(object))
    }

    it('it can parse a domain socket path', () => {
        assert.deepStrictEqual(json(bindable('/var/app/service.sock')), {
            family: 'unix', path: '/var/app/service.sock'
        }, 'path')
    })
    it('it can convert a parsed domain socket path to string', () => {
        const string = String(bindable('/var/app/service.sock'))
        assert.equal(string, '/var/app/service.sock', 'path to string')
    })
    it('it can parse a tcp port', () => {
        assert.deepStrictEqual(json(bindable('8080')), {
            family: 'IPv4', host: '0.0.0.0', port: 8080
        }, 'port')
    })
    it('it can convert a parsed tcp port to string', () => {
        assert.equal(String(bindable('8080')), '0.0.0.0:8080', 'port to string')
    })
    it('it can catch a bad port number', () => {
        const test = []
        try {
            console.log(bindable('X'))
        } catch (error) {
            test.push(error)
        }
        assert.equal(test.shift(), '%s is not bindable', 'port not numeric')
    })
    it('it can parse a tcp interface and port', () => {
        assert.deepStrictEqual(json(bindable('127.0.0.1:8080')), {
            family: 'IPv4', host: '127.0.0.1', port: 8080
        }, 'interface and port')
    })
    it('it can convert a parsed a tcp interface and port to string', () => {
        assert.deepStrictEqual(json(bindable('127.0.0.1:8080')), {
            family: 'IPv4', host: '127.0.0.1', port: 8080
        }, 'interface and port')
    })
    it('it can catch a non-numeric interface part', () => {
        const test = []
        try {
            bindable('X.0.0.1:8080')
        } catch (error) {
            test.push(error)
        }
        assert.equal(test.shift(), '%s is not bindable', 'part not numeric')
    })
    it('it can catch an interface part out of range', () => {
        const test = []
        try {
            bindable('400.0.0.1:8080')
        } catch (error) {
            test.push(error)
        }
        assert.equal(test.shift(), '%s is not bindable', 'part out of range')
    })
    it('it can catch a wrong count of interface parts', () => {
        const test = []
        try {
            bindable('127.0.0.0.1:8080')
        } catch (error) {
            test.push(error)
        }
        assert.equal(test.shift(), '%s is not bindable', 'worng number of parts')
    })
    it('it can create an IPC options object', () => {
        const options = bindable('/var/app/service.sock').options({ backlog: 1 })
        assert.deepStrictEqual(options, {
            path: '/var/app/service.sock',
            backlog: 1
        }, 'ipc options')
    })
    it('it can create a TCP options object', () => {
        const options = bindable(8888).options({ backlog: 1 })
        assert.deepStrictEqual(options, {
            host: '0.0.0.0',
            port: 8888,
            backlog: 1
        }, 'tcp options')
    })
})
