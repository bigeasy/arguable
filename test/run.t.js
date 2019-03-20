require('proof')(1, prove)

function prove (okay) {
    var run = require('../run')
    var object = {}
    run(object, { mainModule: object }, function (options) {
        okay(options.value, 1, 'ran')
    }, { value: 1 })
    run(object, { mainModule: null }, function (options) {
        throw new Error('should not run')
    }, { value: 1 })
}
