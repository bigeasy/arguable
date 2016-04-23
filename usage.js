var Dictionary = require('synonymous')
var fs = require('fs'), slice = [].slice

// The regular expression to match usage markdown.
var numeric = /^(count|number|value|size)$/

function Usage (language, branch, dictionary, command) {
    this.branch = branch
    this.dictionary = dictionary
    this.command = command
    this.language = language
}

Usage.prototype.getPattern = function (command) {
    var patterns = []
    // Extract a definition of the command line arguments from the usage message
    // while tiding the usage message; removing special characters that are flags
    // to Arguable that do not belong in the usage message printed to `stdout`.
    this.chooseUsage(this.language, command).split(/\r?\n/).forEach(function (line) {
        var verbose, terse = '-\t', type = '!', out = '', $, trim = /^$/
        if ($ = /^(?:[\s*@]*(-[\w\d])[@\s]*,)?[@\s]*(--\w[-\w\d_]*)(?:[\s@]*[\[<]([^\]>]+)[\]>][\s@]*)?/.exec(line)) {
            out = $[0], terse = $[1] ? $[1].substring(1) : null
                      , verbose = $[2].substring(2)
                      , type = $[3] && (numeric.test($[3]) ? '#' : '$') || '!'
                      , line = line.substring(out.length)
            patterns.push({
                terse: terse,
                verbose: verbose,
                arguable: type != '!'
            })
            if (!line.length) trim = /\s+$/
        }
    }, this)
    return patterns
}

Usage.prototype.chooseUsage = function (language, command) {
    var path = command.concat('usage')
    var found = this.dictionary.getText(language, path)
    if (!found) {
        found = this.dictionary.getText(this.language, path)
    }
    return found
}

Usage.prototype.format = function (language, command, key, vargs) {
    var path = command, string
    var languages = [ language, this.language ]
    while (languages.length) {
        var language = languages.shift()
        var traverse = path.slice()
        do {
            string = this.dictionary.format.apply(this.dictionary, [ language, path, key ].concat(vargs))
            if (string) {
                return string
            }
        } while (traverse.pop() != null)
    }
    return key
}


function gatherPaths (dictionary, language, path, branch) {
    dictionary.getKeys(language, path).forEach(function (name) {
        if (name == 'usage') {
            branch.executable = true
        } else {
            gatherPaths(dictionary, language, path.concat(name), branch.children[name] = {
                name: name,
                executable: false,
                children: {}
            })
        }
    })
}

Usage.prototype.getCommand = function (argv, previous) {
    var branch = previous ? previous.branch : this.branch, command = (!previous && branch.executable) ? [] : null
    for (var i = 0, I = argv.length; i < I; i++) {
        var child = branch.children[argv[i]]
        if (!child) {
            break
        }
        if (child.executable) {
            command = argv.slice(0, i + 1)
        }
        branch = child
    }
    if (command) {
        return { branch: branch, command: command }
    }
    return null
}

module.exports = function (source) {
    var dictionary = new Dictionary, branch = { executable: false, children: {} }
    dictionary.load(fs.readFileSync(source, 'utf8'))
    var language = dictionary.getLanguages()[0]
    if (!language) {
        return null
    }
    gatherPaths(dictionary, language, [], branch)
    return new Usage(language, branch, dictionary)
}
