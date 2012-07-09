#!/usr/bin/env node

require('./proof')(2, function (glob, path, forward, equal) {
  var found = glob(__dirname + '/../..', [ './t/glob/plain.t' ]);
  equal(found[0].files.length, 1, "find one");
  equal(forward(found[0].files.sort().pop()), 't/glob/plain.t', "found the file we're expecting");
});
