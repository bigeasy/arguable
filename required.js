module.exports = function (program, name) {
    program.validate('%s is required', [].slice.call(arguments, 1), function (
    )
    if (program.params[name].length == 0) {
        program.abend(name + ' is required', value, name)
    }
}
