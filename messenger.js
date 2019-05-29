const events = require('events')
const util = require('util')

class Messenger extends events.EventEmitter {
    constructor () {
        super()
        this.parent = new events.EventEmitter
        this.connected = true
    }

    send (...vargs) {
        this.parent.emit.apply(this.parent, [ 'message' ].concat(vargs.slice(0, 2)))
    }
}

module.exports = Messenger
