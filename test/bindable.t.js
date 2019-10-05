require('proof')(11, (okay) => {
    const bindable = require('../bindable')

    function json (object) {
        return JSON.parse(JSON.stringify(object))
    }

    {
        okay(json(bindable('/var/app/service.sock')), {
            family: 'unix', path: '/var/app/service.sock'
        }, 'parse a domain socket path')
    }
    {
        const string = String(bindable('/var/app/service.sock'))
        okay(string, '/var/app/service.sock', 'convert a parsed domain socket path to string')
    }
    {
        okay(json(bindable('8080')), {
            family: 'IPv4', host: '0.0.0.0', port: 8080
        }, 'parse tcp port')
    }
    {
        okay(String(bindable('8080')), '0.0.0.0:8080', 'convert port to string')
    }
    {
        const test = []
        try {
            console.log(bindable('X'))
        } catch (error) {
            test.push(error)
        }
        okay(test.shift(), '%s is not bindable', 'port not numeric')
    }
    {
        okay(json(bindable('127.0.0.1:8080')), {
            family: 'IPv4', host: '127.0.0.1', port: 8080
        }, 'interface and port')
    }
    {
        const test = []
        try {
            bindable('X.0.0.1:8080')
        } catch (error) {
            test.push(error)
        }
        okay(test.shift(), '%s is not bindable', 'part not numeric')
    }
    {
        const test = []
        try {
            bindable('400.0.0.1:8080')
        } catch (error) {
            test.push(error)
        }
        okay(test.shift(), '%s is not bindable', 'address part out of range')
    }
    {
        const test = []
        try {
            bindable('127.0.0.0.1:8080')
        } catch (error) {
            test.push(error)
        }
        okay(test.shift(), '%s is not bindable', 'worng number of address parts')
    }
    {
        const options = bindable('/var/app/service.sock').options({ backlog: 1 })
        okay(options, {
            path: '/var/app/service.sock',
            backlog: 1
        }, 'domain socket bindable with options')
    }
    {
        const options = bindable(8888).options({ backlog: 1 })
        okay(options, {
            host: '0.0.0.0',
            port: 8888,
            backlog: 1
        }, 'tcp bindable with options')
    }
})
