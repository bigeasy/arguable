describe('numeric', () => {
    const assert = require('assert')
    const numeric = require('../numeric')
    it('can validate a number', () => {
        assert.equal(numeric('3'), 3, 'is numeric')
    })
    it('can reject a number', () => {
        try {
            numeric('x')
        } catch (error) {
            assert.equal(error, '%s is not numeric', 'is not numeric')
            return
        }
        throw new Error
    })
})
