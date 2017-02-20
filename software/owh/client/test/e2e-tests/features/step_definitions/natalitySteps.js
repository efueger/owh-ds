var chai = require('chai');
var chaiAsPromised = require('chai-as-promised');

chai.use(chaiAsPromised);
var expect = chai.expect;

var natalityStepsDefinitionWrapper = function () {

    var natalityPage = require('../support/natality.po');

    this.Then(/^I see "([^"]*)" as first filter category$/, function (arg1) {
        natalityPage.getFilterCategories().then(function(categories) {
            expect(categories.length).to.equal(3);
            expect(categories[0].getText()).to.eventually.equal(arg1);
        });
    });

    this.Then(/^I see (\d+) filters visible$/, function (filterCount) {
        natalityPage.getVisibleFilters(0).then(function (filters) {
            expect(filters.length).to.equal(parseInt(filterCount));
        });
    });

    this.Then(/^I see show more filters link$/, function () {
        expect(element(by.className('show-more-0')).getText()).to.eventually.contains('more filters');
    });

    this.When(/^I click on show more filters link$/, function () {
        element(by.className('show-more-0')).click();
    });

    this.Then(/^I see show more filters link changed to show less filters$/, function () {
        expect(element(by.className('show-less-0')).getText()).to.eventually.contains('less filters');
    });

    this.When(/^I click on show less filters$/, function () {
        element(by.className('show-less-0')).click();
    });
};

module.exports = natalityStepsDefinitionWrapper;