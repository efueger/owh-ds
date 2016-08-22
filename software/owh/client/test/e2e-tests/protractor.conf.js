//jshint strict: false
exports.config = {

  allScriptsTimeout: 11000,

  specs: [
    '**/*.spec.js'
  ],

  capabilities: {
    'browserName': 'chrome'
  },
  onPrepare: function() {
    browser.driver.manage().window().maximize();
  },
  baseUrl: 'http://localhost:9900/',

  framework: 'jasmine',

  jasmineNodeOpts: {
    defaultTimeoutInterval: 30000,
    showColors: true
  }
};
