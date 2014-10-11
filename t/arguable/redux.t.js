#!/usr/bin/env node

/*
    ___ usage: en_US ___
    usage: basic [options] [files]
        -c, --config <key=value> @
            --longonly
    ___ usage ___
*/

var cadence = require('cadence')

require('proof')(1, cadence(function (async, assert) {
    var redux = require('../../redux')
    redux(__filename, {}, [], cadence(function (async, options) {
        throw new Error('raw')
    }), function (error) {
        assert(error.message, 'raw', 'raw exception')
    })
}))
