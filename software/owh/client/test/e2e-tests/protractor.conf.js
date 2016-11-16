//jshint strict: false
exports.config = {

  allScriptsTimeout: 11000,
  framework: 'custom',
  frameworkPath: require.resolve('protractor-cucumber-framework'),

  specs: [
    'features/*.feature'
  ],

  cucumberOpts: {
    // require step definitions
    require: [
      'features/step_definitions/homeSteps.js',
      'features/step_definitions/mortalitySteps.js',
      'features/step_definitions/yrbsSteps.js',
      'features/step_definitions/commonSteps.js'
    ]
  },

  capabilities: {
    'browserName': 'firefox'
  },
  onPrepare: function() {
    browser.driver.manage().window().maximize();
  },
  baseUrl: 'http://localhost:9900/',
  //jasmineNodeOpts: {defaultTimeoutInterval: 60000}
};
