require('proof/redux')(2, prove)

function prove (assert) {
    var numeric = require('../numeric')

    assert(numeric('3'), 3, 'is numeric')

    try {
        numeric('x')
    } catch (error) {
        assert(error, '%s is not numeric', 'is not numeric')
    }
}
