var rescue = require('rescue')

// We do not set the code by calling `process.exit` immediately. We instead set
// set the exit code by hooking the exit event. This means that we're not going
// to shutdown hard, so if our dear user fails to cancel timers and close
// streams, shutdown is going to hang. That is what we want. A program know how
// to able to stop it's own event loops.

module.exports = function (process) {
    return function (error, exitCode) {
        if (error) {
            exitCode = rescue([
                /^bigeasy.arguable#abend$/m, function () {
                    if (error.stderr) {
                        process.stderr.write(error.stderr)
                        process.stderr.write('\n')
                    }
                    return error.exitCode
                },
                /^bigeasy.arguable#help$/m, function () {
                    process.stdout.write(error.stdout)
                    process.stdout.write('\n')
                    return error.exitCode
                }
// TODO Where is exit?
            ])(error)
            if (exitCode == null) {
                exitCode = 1
            }
        }
// TODO We ignore this now. It is always set thorugh `program`.
        if (exitCode != null) {
            process.exitCode = exitCode
        }
    }
}
