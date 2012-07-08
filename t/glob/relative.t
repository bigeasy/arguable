#!/usr/bin/env node

require('./proof')(2, function (glob, path, listing, equal) {
  var found;
  found = glob(__dirname + '/../..', [ './t/../t/glob/plain.t' ]);
  equal(listing(found[0].files).pop(), 'plain.t', "parent");
  found = glob(__dirname + '/../..', [ './t/./glob/plain.t' ]);
  equal(listing(found[0].files).pop(), 'plain.t', "self");
});
