var fs = require('graceful-fs');
var path = require('path');

var sourcemapUrlRegeExp = /^\/\/#\s*sourceMappingURL=/;

var createSourceMapLocatorPreprocessor = function(args, logger, config) {
  /* c8 ignore next */
  var options = config && config.sourceMapLoader || {};
  var remapPrefixes = options.remapPrefixes;
  var remapSource = options.remapSource;
  var useSourceRoot = options.useSourceRoot;
  var onlyWithURL = options.onlyWithURL;
  var strict = options.strict;
  var needsUpdate = remapPrefixes || remapSource || useSourceRoot;

  var log = logger.create('preprocessor.sourcemap');
  var charsetRegex = /^;charset=([^;]+);/;

  return function(content, file, done) {
    function remapSources(sources) {
      var all = sources.length;
      var remapped = 0;
      var remappedPrefixes = {};
      var i, source, remappedSource;

      // Replaces source path prefixes using a key:value map
      function handlePrefixes() {
        var sourcePrefix, targetPrefix, target;
        for (sourcePrefix in remapPrefixes) {
          targetPrefix = remapPrefixes[sourcePrefix];
          if (source.startsWith(sourcePrefix)) {
            target = targetPrefix + source.substring(sourcePrefix.length);
            sources[i] = target;
            ++remapped;
            // Log only one remapping as an example for each prefix to prevent
            // flood of messages on the console
            if (!remappedPrefixes[sourcePrefix]) {
              remappedPrefixes[sourcePrefix] = true;
              log.debug(' ', source, '>>', target);
            }
            return true;
          }
        }
      }

      // Replaces source paths using a custom function
      function handleMapper() {
        var target = remapSource(source);
        // Remapping is considered happenned only if the handler returns
        // a non-empty path different from the existing one
        if (target && target !== source) {
          sources[i] = target;
          ++remapped;
          // Log only one remapping as an example to prevent flooding the console
          if (!remappedSource) {
            remappedSource = true;
            log.debug(' ', source, '>>', target);
          }
          return true;
        }
      }

      for (i = 0; i < all; ++i) {
        // Normalise Windows paths to use only slashes as a separator
        source = sources[i].replaceAll('\\', '/');
        if (remapPrefixes) {
          // One remapping is enough; if a prefix was replaced, do not let
          // the handler below check the source path any more
          if (handlePrefixes()) continue;
        }
        if (remapSource) {
          handleMapper()
        }
      }

      if (remapped) {
        log.debug('  ...');
        log.debug(' ', remapped, 'sources from', all, 'were remapped');
      }
    }

    // Parses a string with source map as JSON and handles errors
    function parseMap(data) {
      try {
        return JSON.parse(data);
      } catch (err) {
        /* c8 ignore next 5 */
        if (strict) {
          done(new Error('malformed source map for', file.originalPath + '\nError: ' + err.message));
          // Returning `false` will make the caller abort immediately
          return false;
        }
        log.warn('malformed source map for', file.originalPath);
        log.warn('Error:', err.message);
      }
    }

    // Sets the sourceRoot property to a fixed or computed value
    function setSourceRoot(sourceMap) {
      sourceMap.sourceRoot = typeof useSourceRoot === 'function' ?
        useSourceRoot(file) : useSourceRoot;
    }

    // Performs configured updates of the source map content
    function updateSourceMap(sourceMap) {
      if (remapPrefixes || remapSource) {
        remapSources(sourceMap.sources);
      }
      if (useSourceRoot) {
        setSourceRoot(sourceMap);
      }
    }

    function sourceMapData(data){
      var sourceMap = parseMap(data);
      if (sourceMap) {
        // Perform the remapping only if there is a configuration for it
        if (needsUpdate) {
          updateSourceMap(sourceMap);
        }
        file.sourceMap = sourceMap;
      /* c8 ignore next 3 */
      } else if (sourceMap === false) {
        return;
      }
      done(content);
    }

    function inlineMap(inlineData){

      var charset = 'utf-8';
      
      if (charsetRegex.test(inlineData)) {
        var matches = inlineData.match(charsetRegex);

        if (matches.length === 2) {
          charset = matches[1];
          inlineData = inlineData.slice(matches[0].length -1);
        }
      }

      if (/^;base64,/.test(inlineData)) {
        // base64-encoded JSON string
        log.debug('base64-encoded source map for', file.originalPath);
        var buffer = Buffer.from(inlineData.slice(';base64,'.length), 'base64');
        sourceMapData(buffer.toString(charset));
      } else if (inlineData.startsWith(',')) {
        // straight-up URL-encoded JSON string
        log.debug('raw inline source map for', file.originalPath);
        sourceMapData(decodeURIComponent(inlineData.slice(1)));
      } else {
        /* c8 ignore next 2 */
        if (strict) {
          done(new Error('invalid source map in ' + file.originalPath));
        } else {
          log.warn('invalid source map in', file.originalPath);
          done(content)
        }
      }
    }

    function fileMap(mapPath, optional) {
      fs.exists(mapPath, function(exists) {
        if (!exists) {
          if (!optional) {
            /* c8 ignore next 3 */
            if (strict) {
              done(new Error('missing external source map for ' + file.originalPath));
              return;
            } else {
              log.warn('missing external source map for', file.originalPath);
            }
          }
          done(content);
          return;
        }

        fs.readFile(mapPath, function(err, data) {
          /* c8 ignore next 10 */
          if (err) {
            if (strict) {
              done(new Error('reading external source map failed for ' + file.originalPath + '\n' + err));
            } else {
              log.warn('reading external source map failed for', file.originalPath);
              log.warn(err);
              done(content);
            }
            return;
          }

          log.debug('external source map exists for', file.originalPath);
          sourceMapData(data);
        });
      });
    }

    // Remap source paths in a directly served source map
    function convertMap() {
      var sourceMap;
      // Perform the remapping only if there is a configuration for it
      if (needsUpdate) {
        log.debug('processing source map', file.originalPath);
        sourceMap = parseMap(content);
        if (sourceMap) {
          updateSourceMap(sourceMap);
          content = JSON.stringify(sourceMap);
        /* c8 ignore next 3 */
        } else if (sourceMap === false) {
          return;
        }
      }
      done(content);
    }

    if (file.path.endsWith('.map')) {
      return convertMap();
    }

    var lines = content.split(/\n/);
    var lastLine = lines.pop();
    while (/^\s*$/.test(lastLine)) {
      lastLine = lines.pop();
    }

    var mapUrl;

    if (sourcemapUrlRegeExp.test(lastLine)) {
      mapUrl = lastLine.replace(sourcemapUrlRegeExp, '');
    }

    if (!mapUrl) {
      if (onlyWithURL) {
        done(content);
      } else {
        fileMap(file.path + ".map", true);
      }
    } else if (/^data:application\/json/.test(mapUrl)) {
      inlineMap(mapUrl.slice('data:application/json'.length));
    } else {
      fileMap(path.resolve(path.dirname(file.path), mapUrl), false);
    }
  };
};

createSourceMapLocatorPreprocessor.$inject = ['args', 'logger', 'config'];

// PUBLISH DI MODULE
module.exports = {
  'preprocessor:sourcemap': ['factory', createSourceMapLocatorPreprocessor]
};
