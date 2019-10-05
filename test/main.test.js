require('proof')(3, async (okay) => {
    const events = require('events')
    const main = require('../main')
    const stream = require('stream')
    const Arguable = require('../arguable')
    {
        const ee = new events.EventEmitter
        ee.stdout = new stream.PassThrough
        await main(ee)((argv) => {
            return { promise: Promise.reject(new Arguable.Error('abend', { stdout: 'x' })) }
        }, [])
        okay(ee.stdout.read().toString(), 'x\n', 'user error to stdout')
    }
    {
        const ee = new events.EventEmitter
        ee.stderr = new stream.PassThrough
        await main(ee)((argv) => {
            return { promise: Promise.reject(new Arguable.Error('abend', { stderr: 'x', exitCode: 1 })) }
        }, [])
        okay({
            stderr: ee.stderr.read().toString(),
            exitCode: ee.exitCode
        }, {
            stderr: 'x\n',
            exitCode: 1
        }, 'user error to stderr')
    }
    {
        const ee = new events.EventEmitter
        await main(ee)((argv) => {
            return { promise: Promise.reject(new Arguable.Error('abend', { exitCode: 1 })) }
        }, [])
        okay(ee.exitCode, 1, 'set exit code')
    }
})
