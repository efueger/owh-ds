var chai = require('chai');
var chaiAsPromised = require('chai-as-promised');

chai.use(chaiAsPromised);
var expect = chai.expect;

var BridgeRaceStepDefinitionsWrapper = function () {

    var bridgeRacePage = require('../support/bridgerace.po');

    this.Then(/^I should see Bridge race search page with filter type "([^"]*)"$/, function (arg) {
        expect(bridgeRacePage.getSelectedFilterType()).to.eventually.equal(arg);
    });

    this.Then(/^I see the data table with race, female, male and total table headers$/, function () {
        var dtTableHeaders = bridgeRacePage.getTableHeaders();
        expect(dtTableHeaders).to.eventually.contains('Race');
        expect(dtTableHeaders).to.eventually.contains('Female');
        expect(dtTableHeaders).to.eventually.contains('Male');
        expect(dtTableHeaders).to.eventually.contains('Total');
    });

    this.Then(/^I see "([^"]*)" as first option in sidebar filters$/, function (arg1) {
        browser.sleep(5000);
        element.all(by.css('.side-filters')).all(by.css('.accordion')).then(function (items) {
            expect(items[0].getText()).to.eventually.contains(arg1);
        });
    });

    this.When(/^I click on row button in row-column switch for "([^"]*)"$/, function (arg1) {
        bridgeRacePage.selectRowOrColumn(arg1, 'Row').click();
    });

    this.Then(/^I see data yearly filter in data table\.$/, function () {
        var dtTableHeaders = bridgeRacePage.getTableHeaders();
        dtTableHeaders.to.eventually.contains('Yearly July 1st Estimates');
    });

    this.Then(/^I see "([^"]*)" filter in data table header$/, function (arg) {
        var dtTableHeaders = bridgeRacePage.getTableHeaders();
        expect(dtTableHeaders).to.eventually.contains(arg);
    });

    this.When(/^I click on sex filter$/, function () {
        bridgeRacePage.sexOptionsLink.click();
    });

    this.Then(/^I see male and female sub filters$/, function () {
        bridgeRacePage.getSubFiltersOfAFilter('Sex').then(function(elements) {
            expect(elements[0].getText()).to.eventually.contains('All');
            expect(elements[1].getText()).to.eventually.contains('Female');
            expect(elements[2].getText()).to.eventually.contains('Male');
        });
    });

    this.Then(/^I see sex filter options disappeared$/, function () {
        bridgeRacePage.getSubFiltersOfAFilter('Sex').then(function(elements) {
            expect(elements[0].isDisplayed()).to.eventually.equal(false);
            expect(elements[1].isDisplayed()).to.eventually.equal(false);
            expect(elements[2].isDisplayed()).to.eventually.equal(false);
        });
    });

    this.Then(/^data element and values are plotted on both the axes$/, function (callback) {

    });

    this.Then(/^the Chart heading appears on the top eg\. Race and Age Group$/, function (callback) {
        // Write code here that turns the phrase above into concrete actions
        callback(null, 'pending');
    });

    this.Then(/^an axis labels is displayed on the graph$/, function (callback) {
        // Write code here that turns the phrase above into concrete actions
        callback(null, 'pending');
    });

    this.Then(/^he should see an Expand button on the top right corner$/, function (callback) {
        // Write code here that turns the phrase above into concrete actions
        callback(null, 'pending');
    });

    this.Then(/^he should see an Share button on the top right corner$/, function (callback) {
        // Write code here that turns the phrase above into concrete actions
        callback(null, 'pending');
    });

    this.Then(/^the graph must be expanded$/, function (callback) {
        // Write code here that turns the phrase above into concrete actions
        callback(null, 'pending');
    });

    this.Then(/^the expand button must be changed to collapse button$/, function (callback) {
        // Write code here that turns the phrase above into concrete actions
        callback(null, 'pending');
    });

    this.Then(/^he should see the legend on the top right corner$/, function (callback) {
        // Write code here that turns the phrase above into concrete actions
        callback(null, 'pending');
    });

    this.When(/^user clicks on the expand button$/, function (callback) {
        // Write code here that turns the phrase above into concrete actions
        callback(null, 'pending');
    });

    this.Then(/^the graph must be collapsed$/, function (callback) {
        // Write code here that turns the phrase above into concrete actions
        callback(null, 'pending');
    });

    this.Then(/^the collapse button must be changed to expand button$/, function (callback) {
        // Write code here that turns the phrase above into concrete actions
        callback(null, 'pending');
    });

    this.Then(/^he should see the legend on the top right corner$/, function (callback) {
        // Write code here that turns the phrase above into concrete actions
        callback(null, 'pending');
    });
};

module.exports = BridgeRaceStepDefinitionsWrapper;