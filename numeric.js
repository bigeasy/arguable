module.exports = function (value) {
    if (isNaN(parseFloat(value)) || !isFinite(value)) {
        throw '%s is not numeric'
    }
    return +value
}
