require('proof')(1, prove)

function prove (okay, callback) {
    var path = require('path')
    var children = require('child_process')
    var child = children.spawn('node', [ path.join(__dirname, 'fixtures/pipe') ], {
        stdio: [ 'inherit', 'inherit', 'inherit', 'pipe' ]
    })
    child.stdio[3].on('data', function (buffer) {
        okay(buffer.toString(), 'opened\n', 'opened')
    })
    child.stdio[3].on('end', function () {
        callback()
    })
}
