# karma-sourcemap-loader

> Preprocessor that locates and loads existing source maps.

## Why

When you use karma not in isolation but as part of a build process (e.g. using grunt
or gulp) it is often the case that the compilation/transpilation is done on a previous
step of the process and not handled by karma preprocessors. In these cases source maps
don't get loaded by karma and you lose the advantages of having them. Collecting
the test code coverage using an instrumented code with source maps, for example.

Another reason may be the need for modifying relative source paths in source maps
to make sure that they point to source files in the project running the tests.

## How it works

This plug-in supports both inline and external source maps.

Inline source maps are located by searching "sourceMappingURL=" inside the javascript
file, both plain text and base64-encoded maps are supported.

External source maps are located by appending ".map" to the javascript file name.
So if for example you have Hello.js, the preprocessor will try to load source map from
Hello.js.map.

## Installation

Just add `karma-sourcemap-loader` as a devDependency in your `package.json`.
```json
{
  "devDependencies": {
    "karma-sourcemap-loader": "~0.3"
  }
}
```

Or issue the following command:
```bash
npm install karma-sourcemap-loader --save-dev
```

## Configuration

The code below shows a sample configuration of the preprocessor.

```js
// karma.conf.js
module.exports = function(config) {
  config.set({
    plugins: ['karma-sourcemap-loader'],
    preprocessors: {
      '**/*.js': ['sourcemap']
    }
  });
};
```

The code below shows a configuration of the preprocessor with remapping of source file paths in source maps using path prefixes. The object `remapPrefixes` contains path prefixes as keys, which if they are detected in a source path, will be replaced by the key value. After the first detected prefix gets replaced, other prefixes will be ignored..

```js
// karma.conf.js
module.exports = function(config) {
  config.set({
    plugins: ['karma-sourcemap-loader'],
    preprocessors: {
      '**/*.js': ['sourcemap']
    },
    sourceMapLoader: {
      remapPrefixes: {
        '/myproject/': '../src/',
        '/otherdep/': '../node_modules/otherdep/'
      }
    }
  });
};
```

The code below shows a configuration of the preprocessor with remapping of source file paths in source maps using a callback. The function `remapSource` receives an original source path and may return a changed source path. If it returns `undefined` or other false-y result, the source path will not be changed.

```js
// karma.conf.js
module.exports = function(config) {
  config.set({
    plugins: ['karma-sourcemap-loader'],
    preprocessors: {
      '**/*.js': ['sourcemap']
    },
    sourceMapLoader: {
      remapSource(source) {
        if (source.startsWith('/myproject/')) {
          return '../src/' + source.substring(11);
        }
      }
    }
  });
};
```

The code below shows a sample configuration of the preprocessor with changing the `sourceRoot` property to a custom value, which will change the location where the debugger should locate the source files.

```js
// karma.conf.js
module.exports = function(config) {
  config.set({
    plugins: ['karma-sourcemap-loader'],
    preprocessors: {
      '**/*.js': ['sourcemap']
    },
    sourceMapLoader: {
      useSourceRoot: '/sources'
    }
  });
};
```

The code below shows a sample configuration of the preprocessor with changing the `sourceRoot` property using a custom function to be able to compute the value depending on the path to the bundle. The `file` argument is the Karma file object `{ path, originalPath }` for the bundle.

```js
// karma.conf.js
module.exports = function(config) {
  config.set({
    plugins: ['karma-sourcemap-loader'],
    preprocessors: {
      '**/*.js': ['sourcemap']
    },
    sourceMapLoader: {
      useSourceRoot(file) {
        return '/sources';
      }
    }
  });
};
```

The code below shows a sample configuration of the preprocessor with source map loading only for files with the `sourceMappingURL` set. The default behaviour is trying to load source maps for all JavaScript files, also those without the `sourceMappingURL` set.

```js
// karma.conf.js
module.exports = function(config) {
  config.set({
    plugins: ['karma-sourcemap-loader'],
    preprocessors: {
      '**/*.js': ['sourcemap']
    },
    sourceMapLoader: {
      onlyWithURL: true
    }
  });
};
```

The code below shows a sample configuration of the preprocessor with a strict error checking. A missing or an invalid source map will cause the test run fail.

```js
// karma.conf.js
module.exports = function(config) {
  config.set({
    plugins: ['karma-sourcemap-loader'],
    preprocessors: {
      '**/*.js': ['sourcemap']
    },
    sourceMapLoader: {
      strict: true
    }
  });
};
```
