#!/usr/bin/env node

require('./proof')(3, function (glob, path, forward, equal) {
  var found;
  found = glob(__dirname + '/../..', [ './t/*/plain.t' ]);
  equal(forward(found[0].files.pop()), 't/glob/plain.t', "wildcard");
  found = glob(__dirname + '/../..', [ './t/*/*.t' ]);
  equal(found[0].files.length, 13, "find many");
  equal(forward(found[0].files.sort().pop()), 't/i18n/i18n.t', "partial wildcard");
});
