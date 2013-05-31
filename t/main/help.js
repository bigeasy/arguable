var arguable = require('../..');

/*

  ___ usage: en_US ___
  usage: node help.js

    Emits a usage message and exits successfully.

  ___ usage ___

*/

arguable.parse(__filename, function (options) {
  options.help();
});
