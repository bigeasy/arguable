#!/usr/bin/env node

require('./proof')(3, function (glob, path, listing, equal) {
  var found;
  found = glob(__dirname + '/../..', [ './t/*/plain.t' ]);
  equal(listing(found[0].files).pop(), 'plain.t', "wildcard");
  found = glob(__dirname + '/../..', [ './t/*/*.t' ]);
  equal(found[0].files.length, 6, "find many");
  equal(listing(found[0].files).sort().pop(), 'star.t', "partial wildcard");
});
