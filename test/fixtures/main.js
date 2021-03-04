require('../..')(module, async arguable => {
    await arguable.destroyed
    return arguable.isMainModule
})
