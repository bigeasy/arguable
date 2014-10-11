require('arguable')(__filename, require('cadence')(function (options, callback) {

}), function (completions) {

    completions
        .on('files', function (callback) {
            completions.glob('*/*/*.t.js', callback)
        })
        .on('commands', [ 'run', 'this', 'that' ])

})
