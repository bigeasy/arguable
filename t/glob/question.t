#!/usr/bin/env node

require('./proof')(1, function (glob, path, forward, equal) {
  var found;
  found = glob(__dirname + '/../..', [ './t/glob/?lain.t' ]);
  equal(forward(found[0].files.pop()), 't/glob/plain.t', "question");
});
