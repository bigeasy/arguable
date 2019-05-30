require('../..')(module, (arguable) => {
    return new Promise(resolve => {
        arguable.options.messenger.on('message', function (message) {
            if (message.method == 'shutdown') {
                resolve(0)
            }
        })
    })
})
