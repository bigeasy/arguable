describe('messenger', () => {
    const assert = require('assert')
    const Messenger = require('../messenger')
    it('can catch an exception', () => {
        const test = []
        const messenger = new Messenger
        messenger.parent.once('message', (message, socket) => test.push(message, socket))
        messenger.send(1, { readable: true })
        assert.deepStrictEqual(test, [ 1, { readable: true } ], 'send')
    })
})
