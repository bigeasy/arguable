#!/usr/bin/env node

require('proof')(1, function (deepEqual) {
  var arguable = require('../..')
    ;
  deepEqual(arguable.flatten('progress', { width: 3, monochrome: true })
         , [ 'progress', '--monochrome', '--width', '3' ], 'flatten');
});

