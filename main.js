module.exports = function (process) {
    async function main (f, argv) {
        let exitCode = null
        try {
            exitCode = await f(argv).promise
        } catch (error) {
            if (/^bigeasy\.arguable#abend/m.test(error.message)) {
                console.log('here!!! >>>>', error.stdout)
                if (error.stdout) {
                    process.stdout.write(error.stdout)
                    process.stdout.write('\n')
                } else if (error.stderr) {
                    process.stderr.write(error.stderr)
                    process.stderr.write('\n')
                }
                exitCode = error.exitCode
            } else {
                throw error
            }
        }
        if (exitCode != null && typeof exitCode == 'number') {
            process.exitCode = exitCode
        }
    }
    return function (f, argv, catcher) {
        main(f, argv).catch(catcher)
    }
}
