var fs = require('fs');
var createSourceMapLocatorPreprocessor = function(args, logger, helper) {
  var log = logger.create('preprocessor.sourcemap');

  return function(content, file, done) {
    var mapPath = file.path+".map";
    fs.exists(mapPath, function(exists) {
      if (!exists) {
        done(content);
        return;
      }
      fs.readFile(mapPath, function(err, data) {
        if (err) throw err;
        file.sourceMap = JSON.parse(data);
        done(content);
      });
    });
  };
};

createSourceMapLocatorPreprocessor.$inject = ['args', 'logger', 'helper'];

// PUBLISH DI MODULE
module.exports = {
  'preprocessor:sourcemap': ['factory', createSourceMapLocatorPreprocessor]
};
