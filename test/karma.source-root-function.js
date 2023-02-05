const sharedConfig = require('./karma.shared');

module.exports = function (config) {
  config.set(
    Object.assign({}, sharedConfig(config, 'test-source-root'), {
      sourceMapLoader: {
        // eslint-disable-next-line no-unused-vars
        useSourceRoot(file) {
          return '/sources';
        },
      },
    })
  );
};
