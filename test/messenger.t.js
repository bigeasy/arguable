require('proof')(1, prove)

function prove (okay) {
    var Messenger = require('../messenger')
    var messenger = new Messenger
    messenger.parent.once('message', function (message, socket) {
        okay({
            message: message,
            socket: socket
        }, {
            message: 1,
            socket: { readable: true }
        }, 'send')
    })
    messenger.send(1, { readable: true })
}
