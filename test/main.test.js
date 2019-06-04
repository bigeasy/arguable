describe('main', () => {
    const assert = require('assert')
    const events = require('events')
    const main = require('../main')
    const stream = require('stream')
    const Arguable = require('../arguable')
    it('can write a user error to stdout', async () => {
        const ee = new events.EventEmitter
        ee.stdout = new stream.PassThrough
        await main(ee)((argv) => {
            return { promise: Promise.reject(new Arguable.Error('abend', { stdout: 'x' })) }
        }, [])
        assert.equal(ee.stdout.read().toString(), 'x\n', 'stdout')
    })
    it('can write a user error to stderr', async () => {
        const ee = new events.EventEmitter
        ee.stderr = new stream.PassThrough
        await main(ee)((argv) => {
            return { promise: Promise.reject(new Arguable.Error('abend', { stderr: 'x', exitCode: 1 })) }
        }, [])
        assert.equal(ee.stderr.read().toString(), 'x\n', 'stderr')
        assert.equal(ee.exitCode, 1, 'set exit code')
    })
    it('can merely set an exit code', async () => {
        const ee = new events.EventEmitter
        await main(ee)((argv) => {
            return { promise: Promise.reject(new Arguable.Error('abend', { exitCode: 1 })) }
        }, [])
        assert.equal(ee.exitCode, 1, 'set exit code')
    })
})
