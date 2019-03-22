var events = require('events')
var util = require('util')

function Messenger () {
    this.parent = new events.EventEmitter
    events.EventEmitter.call(this)
}
util.inherits(Messenger, events.EventEmitter)

Messenger.prototype.send = function () {
    var vargs = []
    vargs.push.apply(vargs, arguments)
    this.parent.emit.apply(this.parent, [ 'message' ].concat(vargs.slice(0, 2)))
}

module.exports = Messenger
