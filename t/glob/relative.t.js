#!/usr/bin/env node

require('./proof')(2, function (glob, path, forward, equal) {
  var found;
  found = glob(__dirname + '/../..', [ './t/../t/glob/plain.t.js' ]);
  equal(forward(found[0].files.pop()), 't/glob/plain.t.js', "parent");
  found = glob(__dirname + '/../..', [ './t/./glob/plain.t.js' ]);
  equal(forward(found[0].files.pop()), 't/glob/plain.t.js', "self");
});
