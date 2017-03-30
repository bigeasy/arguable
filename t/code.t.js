require('proof')(6, prove)

function prove (assert) {
    var code = require('../code')
    var events = require('events')

    function extend (to, from) {
        for (var key in from) {
            to[key] = from[key]
        }
        return to
    }

    var ee
    code(ee = extend(new events.EventEmitter, {
        versions: { node: '0.12.0' }
    }))
    ee.emit('exit', 0)

    code(ee = extend(new events.EventEmitter, {
        versions: { node: '0.10.0' },
        exitCode: 1,
        exit: function (exitCode) {
            assert(exitCode, 1, 'version 0.10 or less')
        }
    }))
    ee.emit('exit', 0)

    code(ee = extend(new events.EventEmitter, {
        versions: { node: '0.11.7' },
        exitCode: 1,
        exit: function (exitCode) {
            assert(exitCode, 1, 'version 0.11.7 or less')
        }
    }))
    ee.emit('exit', 0)

    code(ee = extend(new events.EventEmitter, {
        versions: { node: '0.10.0' },
        exit: function (exitCode) {
            assert(exitCode, 0, 'exit handler no exit code')
        }
    }))
    ee.emit('exit', 0)

    ee = new events.EventEmitter
    ee.on('exit', function (exitCode) {
        assert(this === ee, 'this set correctly')
        assert(exitCode, 1, 'other exit handler called')
    })

    try {
        code(extend(ee, {
            versions: { node: '0.10.0' },
            exitCode: 1,
            exit: function (exitCode) {
                assert(exitCode, 1, 'exit handler no exit code')
                throw new Error
            }
        }))
        ee.emit('exit', 0)
    } catch (error) {
    }
}
