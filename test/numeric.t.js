require('proof')(2, (okay) => {
    const numeric = require('../numeric')
    okay(numeric('3'), 3, 'is numeric')
    try {
        numeric('x')
        throw new Error
    } catch (error) {
        okay(error, '%s is not numeric', 'is not numeric')
    }
})
