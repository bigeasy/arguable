describe('rethrow', () => {
    const assert = require('assert')
    const rethrow = require('../rethrow')
    it('can throw', () => {
        try {
            rethrow(new Error('thrown'))
        } catch (error) {
            assert.equal(error.message, 'thrown', 'thrown')
        }
    })
})
