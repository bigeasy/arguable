module.exports = function (error) {
    setImmediate(() => { throw error })
}
