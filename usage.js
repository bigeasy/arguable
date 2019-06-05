const Dictionary = require('synonymous')
const fs = require('fs')

class Usage {
    constructor (language, dictionary) {
        this.dictionary = dictionary
        this.language = language
    }

    getPattern (command) {
        const patterns = []
        // Extract a definition of the command line arguments from the usage message
        // while tiding the usage message; removing special characters that are flags
        // to Arguable that do not belong in the usage message printed to `stdout`.
        this.chooseUsage(this.language).split(/\r?\n/).forEach(function (line) {
            let $
            if ($ = /^(?:[\s*@]*(-[\w\d])[@\s]*,)?[@\s]*(--\w[-\w\d_]*)(?:[\s@]*[\[<]([^\]>]+)[\]>][\s@]*)?/.exec(line)) {
                const out = $[0]
                const terse = $[1] ? $[1].substring(1) : null
                const verbose = $[2].substring(2)
                const valuable = !! $[3]
                line = line.substring(out.length)
                patterns.push({ terse, verbose, valuable })
            }
        }, this)
        return patterns
    }

    getLanguageOptions (language) {
        return ([ language, this.language ]).filter(function (language) { return language })
    }

    chooseUsage (language) {
        const languages = this.getLanguageOptions()
        while (languages.length) {
            const found = this.dictionary.getText(languages.shift(), [ 'usage' ])
            if (found) {
                return found
            }
        }
        return ''
    }

    format (language, key, vargs) {
        const path = []
        const languages = this.getLanguageOptions(language)
        while (languages.length) {
            const language = languages.shift()
            const string = this.dictionary.format.apply(this.dictionary, [ language, path, key ].concat(vargs))
            if (string) {
                return string
            }
        }
        return key
    }
}

module.exports = function (source) {
    const dictionary = new Dictionary
    dictionary.load(fs.readFileSync(source, 'utf8'))
    const language = dictionary.getLanguages()[0]
    return new Usage(language || '', dictionary)
}
