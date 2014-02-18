# karma-sourcemap-loader

> Preprocessor that locates and loads existing source map files.

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

The code below shows the sample configuration of the preprocessor.
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
