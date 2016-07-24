var Dictionary = require('synonymous')
var fs = require('fs')

function Usage (language, dictionary) {
    this.dictionary = dictionary
    this.language = language
}

Usage.prototype.getPattern = function (command) {
    var patterns = []
    // Extract a definition of the command line arguments from the usage message
    // while tiding the usage message; removing special characters that are flags
    // to Arguable that do not belong in the usage message printed to `stdout`.
    this.chooseUsage(this.language).split(/\r?\n/).forEach(function (line) {
        var $
        if ($ = /^(?:[\s*@]*(-[\w\d])[@\s]*,)?[@\s]*(--\w[-\w\d_]*)(?:[\s@]*[\[<]([^\]>]+)[\]>][\s@]*)?/.exec(line)) {
            var out = $[0]
            var terse = $[1] ? $[1].substring(1) : null
            var verbose = $[2].substring(2)
            var arguable = !! $[3]
            line = line.substring(out.length)
            patterns.push({
                terse: terse,
                verbose: verbose,
                arguable: arguable
            })
        }
    }, this)
    return patterns
}

Usage.prototype.chooseUsage = function (language) {
    var found = this.dictionary.getText(language, [ 'usage' ])
    if (!found) {
        found = this.dictionary.getText(this.language, [ 'usage' ])
    }
    return found
}

Usage.prototype.format = function (language, key, vargs) {
    var path = [], string
    var languages = [ language, this.language ]
    while (languages.length) {
        var language = languages.shift()
        string = this.dictionary.format.apply(this.dictionary, [ language, path, key ].concat(vargs))
        if (string) {
            return string
        }
    }
    return key
}

module.exports = function (source) {
    var dictionary = new Dictionary
    dictionary.load(fs.readFileSync(source, 'utf8'))
    var language = dictionary.getLanguages()[0]
    if (!language) {
        return null
    }
    return new Usage(language, dictionary)
}
