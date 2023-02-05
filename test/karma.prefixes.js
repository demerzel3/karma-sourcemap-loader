const sharedConfig = require('./karma.shared');

module.exports = function (config) {
  config.set(
    Object.assign({}, sharedConfig(config, 'test-sources'), {
      sourceMapLoader: {
        remapPrefixes: { '/test/': '../src/' },
      },
    })
  );
};
