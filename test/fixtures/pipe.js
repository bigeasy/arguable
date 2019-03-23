var pipe = require('../../pipe')

var socket = pipe({ fd: 3, writable: true })

socket.end('opened\n')
