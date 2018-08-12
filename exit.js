var rescue = require('rescue/redux')

// We do not set the code by calling `process.exit` immediately. We instead set
// set the exit code by hooking the exit event. This means that we're not going
// to shutdown hard, so if our dear user fails to cancel timers and close
// streams, shutdown is going to hang. That is what we want. A program know how
// to able to stop it's own event loops.

module.exports = function (process) {
    return function (error, exitCode) {
        if (error) {
            exitCode = rescue([{
                name: 'abend',
                when: [ '..', /^bigeasy.arguable#abend$/m, 'only' ]
            }, {
                name: 'help',
                when: [ '..', /^bigeasy.arguable#help$/m, 'only' ]
            }], function (rescued) {
                var error = rescued.errors.shift()
                if (error.stdout) {
                    process.stdout.write(error.stdout)
                    process.stdout.write('\n')
                } else if (error.stderr) {
                    process.stderr.write(error.stderr)
                    process.stderr.write('\n')
                }
                return error.exitCode
// TODO Where is exit?
            })(error)
            if (exitCode == null) {
                exitCode = 1
            }
        }
        if (exitCode != null && typeof exitCode == 'number') {
            process.exitCode = exitCode
        }
    }
}
