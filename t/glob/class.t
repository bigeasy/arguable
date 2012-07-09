#!/usr/bin/env node

require('./proof')(2, function (glob, path, forward, equal) {
  var found;
  found = glob(__dirname + '/../..', [ './t/glob/[p-s]lain.t' ]);
  equal(forward(found[0].files.pop()), 't/glob/plain.t', "class");
  found = glob(__dirname + '/../..', [ './t/glob/[!s]lain.t' ]);
  equal(forward(found[0].files.pop()), 't/glob/plain.t', "negated");
});
