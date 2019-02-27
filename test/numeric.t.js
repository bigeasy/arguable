require('proof')(2, prove)

function prove (okay) {
    var numeric = require('../numeric')

    okay(numeric('3'), 3, 'is numeric')

    try {
        numeric('x')
    } catch (error) {
        okay(error, '%s is not numeric', 'is not numeric')
    }
}
