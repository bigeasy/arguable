#!/usr/bin/env node

require('./proof')(8, function (glob, path, forward, equal) {
  var found;
  found = glob(__dirname + '/../..', [ './t/glob/{plain,class}.t' ]);
  equal(found[0].files.length, 2, "find many");
  equal(forward(found[0].files.sort().pop()), 't/glob/plain.t', "alternation");
  found = glob(__dirname + '/../..', [ './t/glob/{plai?,class}.t' ]);
  equal(found[0].files.length, 2, "find many with question");
  equal(forward(found[0].files.sort().pop()), 't/glob/plain.t', "alternation with question");
  found = glob(__dirname + '/../..', [ './t/glob/{p*,class}.t' ]);
  equal(found[0].files.length, 2, "find many with star");
  equal(forward(found[0].files.sort().pop()), 't/glob/plain.t', "alternation with star");
  found = glob(__dirname + '/../..', [ './t/glob/{{plain,star},class}.t' ]);
  equal(found[0].files.length, 3, "find many with alternation");
  equal(forward(found[0].files.sort().pop()), 't/glob/star.t', "alternation with alternation");
});
