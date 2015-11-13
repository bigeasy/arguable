var cadence = require('cadence')

var completions = require('arguable')(module, cadence(function (async, program) {
}))

completions.when('files', cadence(function (async) {
}))

completions.when('command:run', [ 'run', 'this', 'that' ])
