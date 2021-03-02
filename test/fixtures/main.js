require('../..')(module, async arguable => {
    await new Promise(resolve => arguable.on('destroy', resolve))
    return arguable.isMainModule
})
