require('arguable')(module, { $trap: true }, async (arguable) => {
    const destructible = new (require('destructible'))(5000, 'es6.t.js')

    fastify = require('./server')(service)
    destructible.durable('pump', service.pump(), () => service.destroy())

    await fastify.listen(0)

    destructible.durable('server', once(fastify.service, 'close', null).promise, () => fastify.close())
    await arguable.destroyed
    destructible.destroy()
    await destructible.destructed

    return 0
})

/*
const arguable = require('../main')

const child = arguable({}, { $signals: new events.EventEmitter })
child.options.$signals.emit('SIGHUP')
assert.equal(await child.terminate(), 0, 'term')
*/
