const sharedConfig = require('./karma.shared');

module.exports = function (config) {
  config.set(Object.assign({}, sharedConfig(config, 'test-sources'), {
    sourceMapLoader: {
      remapSource(source) {
        if (source.startsWith('/test/')) {
          return `../src/${source.substring(6)}`;
        }
      }
    }
  }));
};
