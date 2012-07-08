var path = require('path')
  , sep = process.platform.indexOf('win') ? '/' : '\\'
  ;

module.exports = require('proof')(function () {
  function listing (files) {
    return files.map(function (file) {
      return file.split(sep).pop()
    });
  }
  return { listing: listing, path: path, glob: require('../../index').glob };
});
