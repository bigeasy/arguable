module.exports = function (process) {
    const rescue = require('rescue')
    const Arguable = require('./arguable')
    process.on('unhandledRejection', require('./rethrow'))
    return async function main (f, argv) {
        let exitCode = null
        try {
            exitCode = await f(argv).promise
        } catch (error) {
            rescue(error, [ Arguable.Error ], (error) => {
                if (error.stdout) {
                    process.stdout.write(error.stdout)
                    process.stdout.write('\n')
                } else if (error.stderr) {
                    process.stderr.write(error.stderr)
                    process.stderr.write('\n')
                }
                exitCode = error.exitCode
            })
        }
        if (exitCode != null && typeof exitCode == 'number') {
            process.exitCode = exitCode
        }
    }
}
