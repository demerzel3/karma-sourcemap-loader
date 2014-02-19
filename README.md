# karma-sourcemap-loader

> Preprocessor that locates and loads existing source map files.

## Why

When you use karma not in isolation but as part of a build process (e.g. using grunt
or gulp) it is often the case that the compilation/transpilation is done on a previous
step of the process and not handled by karma preprocessors. In these cases source maps
don't get loaded by karma and you lose the advantages of having them.

## How it works

Right now source maps are located via this rule: the preprocessors appends
".map" to the file name, and if that file exists it loads and includes it.

So if for example you have Hello.js, the preprocessor will try to load source map from
Hello.js.map.

This is very simple but should work in the majority of cases for standard usage (e.g. with typescript).

## Installation

Just write `karma-sourcemap-loader` as a devDependency in your `package.json`.
```json
{
  "devDependencies": {
    "karma-sourcemap-loader": "~0.1"
  }
}
```

Or just issue the following command:
```bash
npm install karma-sourcemap-loader --save-dev
```

## Configuration

The code below shows a sample configuration of the preprocessor.
```js
// karma.conf.js
module.exports = function(config) {
  config.set({
    preprocessors: {
      '**/*.js': ['sourcemap']
    }
  });
};
```
