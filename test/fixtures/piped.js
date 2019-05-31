require('../..')(module, {
    $pipes: { 3: { writable: true } }
}, arguable => {
    arguable.pipes[3].end('piped\n')
    return 0
})
