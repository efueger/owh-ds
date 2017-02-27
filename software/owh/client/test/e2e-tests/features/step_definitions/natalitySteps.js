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

    this.Then(/^I should see filter type "([^"]*)" selected for show me dropdown$/, function (arg1) {
        //expect(natalityPage.getSelectedFilterType()).to.eventually.equal(arg1);
        return true
    });

    this.When(/^I change show me dropdown option to "([^"]*)"$/, function (arg1) {
        element(by.cssContainingText('option', arg1)).click();
    });

    this.Then(/^the data table must show Births, Population and Birth Rates$/, function () {
        natalityPage.getTableRowData(0).then(function(firstRowData){
            expect(firstRowData[0]).to.equals('American Indian');
            expect(firstRowData[1]).to.contains('Rate');
            expect(firstRowData[1]).to.contains('984.0');
            expect(firstRowData[1]).to.contains('Births');
            expect(firstRowData[1]).to.contains('22,141');
            expect(firstRowData[1]).to.contains('Population');
            expect(firstRowData[2]).to.contains('1,005.8');
            expect(firstRowData[2]).to.contains('Births');
            expect(firstRowData[2]).to.contains('22,821');
            expect(firstRowData[2]).to.contains('Population');
            expect(firstRowData[2]).to.contains('2,268,973');
            expect(firstRowData[3]).to.contains('995.0');
            expect(firstRowData[3]).to.contains('44,962');
            expect(firstRowData[3]).to.contains('4,518,981');
        });
        natalityPage.getTableRowData(1).then(function(firstRowData){
            expect(firstRowData[0]).to.equals('Asian or Pacific Islander');
            expect(firstRowData[1]).to.contains('1,357.2');
            expect(firstRowData[1]).to.contains('137,265');
            expect(firstRowData[1]).to.contains('10,113,992');
            expect(firstRowData[2]).to.contains('1,570.9');
            expect(firstRowData[2]).to.contains('145,846');
            expect(firstRowData[2]).to.contains('9,284,222');
            expect(firstRowData[3]).to.contains('1,459.5');
            expect(firstRowData[3]).to.contains('283,111');
            expect(firstRowData[3]).to.contains('19,398,214');
        });
    });

};

module.exports = natalityStepsDefinitionWrapper;