var path = require('path')
  , sep = process.platform.indexOf('win') ? '/' : '\\'
  ;

module.exports = function (files) {
  return files.map(function (file) {
    return file.split(sep).pop()
  });
}
