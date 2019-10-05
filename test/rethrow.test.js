require('proof')(1, (okay) => {
    const rethrow = require('../rethrow')
    try {
        rethrow(new Error('thrown'))
        throw new Error
    } catch (error) {
        okay(error.message, 'thrown', 'thrown')
    }
})
