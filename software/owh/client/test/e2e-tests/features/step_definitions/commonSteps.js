var chai = require('chai');
var chaiAsPromised = require('chai-as-promised');

chai.use(chaiAsPromised);
var expect = chai.expect;
var currentUrl = "";
var previousUrl = "";

var commonStepDefinitionsWrapper = function () {

    this.Then(/^URL in browser bar should change$/, function () {
        browser.getCurrentUrl().then(function(url) {
            expect(url).not.to.equal(browser.baseUrl);
        });
    });

    this.Then(/^URL in browser bar should not be base URL$/, function () {
        browser.getCurrentUrl().then(function(url) {
            expect(url).to.contains("/search/");
        });
    });

    this.When(/^I selects the back button then browser URL should change$/, function () {
        var previousUrl = browser.getCurrentUrl().then(function(url) {
            return url;
        });
        browser.navigate().back();
        expect(browser.getCurrentUrl()).not.to.eventually.equal(previousUrl)
    });

    this.When(/^I selects the forward button in browser then URL should change$/, function () {
        var previousUrl = browser.getCurrentUrl().then(function(url) {
            return url;
        });
        browser.navigate().forward();
        expect(browser.getCurrentUrl()).not.to.eventually.equal(previousUrl)
    });
};
module.exports = commonStepDefinitionsWrapper;