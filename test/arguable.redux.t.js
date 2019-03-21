require('proof')(1, prove)

function prove (okay) {
    var Arguable = require('arguable')
    var arguable = new Arguable({
        parameters: [{ name: 'parameter', value: '1' }],
        argv: [],
        stdin: new stream.PassThrough,
        stderr: new stream.PassThrough,
        stdout: new stream.PassThrough,
        stdio: [ '2' ]
    })
    arguable.required('parameter')

}
