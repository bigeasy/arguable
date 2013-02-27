#!/usr/bin/env node

require('./proof')(3, function (glob, path, forward, equal) {
  var found;
  found = glob(__dirname + '/../..', [ './t/*/plain.t.js' ]);
  equal(forward(found[0].files.pop()), 't/glob/plain.t.js', "wildcard");
  found = glob(__dirname + '/../..', [ './t/*/*.t.js' ]);
  equal(found[0].files.length, 17, "find many");
  equal(forward(found[0].files.sort().pop()), 't/main/usage.t.js', "partial wildcard");
});
