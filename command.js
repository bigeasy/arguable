var interrupt = require('interrupt').createInterrupter('bigeasy.arguable')
var slice = [].slice

function Command (usage, lang, path) {
    this._usage = usage
    this._lang = lang
    this._path = path
}

Command.prototype.abend = function () {
    var vargs = slice.call(arguments), key = vargs.shift(), code
    if (typeof key == 'number') {
        this._code = key
        key = vargs.shift()
    } else {
        this._code = 1
    }
    var message
    if (key) {
        message = this._usage.format(this.lang, this.path, key, vargs)
    }
    this._redirect = 'stderr'
    throw interrupt(new Error('abend'), { key: key, stderr: message, code: this._code })
}

Command.prototype.help = function () {
    this._code = 0
    throw interrupt(new Error('help'), {
        stdout: this._usage.chooseUsage(this.lang, this.command),
        code: this._code
    })
}
