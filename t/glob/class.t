#!/usr/bin/env node

require('./proof')(2, function (glob, path, listing, equal) {
  var found;
  found = glob(__dirname + '/../..', [ './t/glob/[p-s]lain.t' ]);
  equal(listing(found[0].files).pop(), 'plain.t', "class");
  found = glob(__dirname + '/../..', [ './t/glob/[!s]lain.t' ]);
  equal(listing(found[0].files).pop(), 'plain.t', "negated");
});
