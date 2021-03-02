require('../..')(module, { $trap: { SIGINT: 'default' } }, async arguable => {
    return await new Promise(resolve => arguable.once('destroy', resolve))
})
