var fs = require('fs');

var createSourceMapLocatorPreprocessor = function(args, logger, helper) {
  var log = logger.create('preprocessor.sourcemap');

  return function(content, file, done) {
    var match = content.match(/#\s*sourceMappingURL=(data:application\/json.+)$/m);
    if (match !== null && match.length == 2) {
      // inline source map
      var data;
      var b64Match = match[1].match(/^data:.+\/(.+);base64,(.*)$/);
      if (b64Match !== null && b64Match.length == 3) {
        // base64-encoded JSON string
        log.debug('base64-encoded source map for', file.originalPath);
        var buffer = new Buffer(b64Match[2], 'base64');
        data = buffer.toString();
      } else {
        // straight-up URL-encoded JSON string
        log.debug('raw inline source map for', file.originalPath);
        data = decodeURIComponent(match[1].slice('data:application/json'.length));
      }
      file.sourceMap = JSON.parse(data);
      done(content);
    } else {
      var mapPath = file.path+".map";
      fs.exists(mapPath, function(exists) {
        if (!exists) {
          done(content);
          return;
        }
        fs.readFile(mapPath, function(err, data) {
          if (err) throw err;
          log.debug('external source map exists for', file.originalPath);
          file.sourceMap = JSON.parse(data);
          done(content);
        });
      });
    }
  };
};

createSourceMapLocatorPreprocessor.$inject = ['args', 'logger', 'helper'];

// PUBLISH DI MODULE
module.exports = {
  'preprocessor:sourcemap': ['factory', createSourceMapLocatorPreprocessor]
};
