var interrupt = require('interrupt')

// We do not set the code by calling `process.exit` immediately. We instead set
// set the exit code by hooking the exit event. This means that we're not going
// to shutdown hard, so if our dear user fails to cancel timers and close
// streams, shutdown is going to hang. That is what we want. A program know how
// to able to stop it's own event loops.

module.exports = function (process) {
    return function (error, exitCode) {
        if (error) {
            exitCode = interrupt.rescue([
                'bigeasy.arguable.abend', function () {
                    if (error.stderr) {
                        process.stderr.write(error.stderr)
                        process.stderr.write('\n')
                    }
                    return error.code || 1
                },
                'bigeasy.arguable.help', function () {
                    process.stdout.write(error.stdout)
                    process.stdout.write('\n')
                    return error.code || 0
                }
            ])(error)
        }
        if (exitCode != null) {
            process.exitCode = exitCode
        }
    }
}
