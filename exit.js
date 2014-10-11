// We do not set the code by calling `process.exit` immediately. We instead set
// set the exit code by hooking the exit event. This means that we're not going
// to shutdown hard, so if our dear user fails to cancel timers and close
// streams, shutdown is going to hang. That is what we want. A program know how
// to able to stop it's own event loops.

module.exports = function (process) {
    return function (error, code) {
        if (error) throw error
        process.on('exit', function () {
            process.exit(code)
        })
    }
}
