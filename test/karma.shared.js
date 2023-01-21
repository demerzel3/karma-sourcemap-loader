module.exports = function(config) {
  return {
    plugins: [
      'karma-jasmine', 'karma-brief-reporter', 'karma-chrome-launcher',
      require('..')
    ],

    frameworks: ['jasmine'],

    files: [
      { pattern: 'test.js', nocache: true },
      { pattern: 'out/*.js' }
    ],

    preprocessors: {
      'out/*.js': ['sourcemap']
    },

    reporters: ['brief'],

    browsers: ['ChromeHeadless'],

    briefReporter: { renderOnRunCompleteOnly: !!process.env.CI },

    // logLevel: config.LOG_DEBUG,
    autoWatch: false,
    singleRun: true
  };
};
