#!/usr/bin/env node

require('./proof')(1, function (glob, path, listing, equal) {
  var found;
  found = glob(__dirname + '/../..', [ './t/glob/?lain.t' ]);
  equal(listing(found[0].files).pop(), 'plain.t', "question");
});
