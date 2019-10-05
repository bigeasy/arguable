require('proof')(1, (okay) => {
    const Messenger = require('../messenger')
    const test = []
    const messenger = new Messenger
    messenger.parent.once('message', (message, socket) => test.push(message, socket))
    messenger.send(1, { readable: true })
    okay(test, [ 1, { readable: true } ], 'send')
})
