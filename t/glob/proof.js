var path = require('path')
  , sep = process.platform.indexOf('win') ? '/' : '\\'
  ;

module.exports = require('proof')(function () {
  function forward (path) { return path.split(sep).join('/') }
  return { forward: forward, path: path, glob: require('../../index').glob };
});
