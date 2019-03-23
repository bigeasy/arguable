function Child (destructible, exit, options) {
    this._destructible = destructible
    this._exit = exit
    this.options = options
}

Child.prototype.destroy = function () {
    this._destructible.destroy()
}

Child.prototype.exit = function (callback) {
    this._exit.wait(callback)
}

module.exports = Child
