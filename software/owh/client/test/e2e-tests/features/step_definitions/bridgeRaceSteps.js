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

    this.When(/^I see a visualization$/, function () {
        browser.sleep(5000);
        bridgeRacePage.isVisualizationDisplayed().then(function(value) {
            expect(value).to.equal(true);
        });
    });

    this.Then(/^I see data element and values are plotted on both the axes$/, function () {
        bridgeRacePage.isVisualizationDisplayed().then(function(value) {
            expect(value).to.equal(true);
        });
    });

    this.Then(/^I see chart heading appears on the top$/, function () {
        bridgeRacePage.getGraphTitle().then(function(value) {
            expect(value[0].getText()).to.eventually.contains('Sex and Race');
        });
    });

    this.Then(/^I see an axis labels are displayed on the graph$/, function () {
        var labelArr = bridgeRacePage.getAxisLabelsForAGraph(0);
        expect(labelArr[0].getText()).to.eventually.equal('Race');
        expect(labelArr[1].getText()).to.eventually.equal('Population');
    });

    this.Then(/^I see an Expand button on the top right corner$/, function () {
        bridgeRacePage.isExpandBtnDisplayed().then(function(value) {
            expect(value).to.equal(true);
        });
    });

    this.Then(/^I see an share button on the top right corner$/, function () {
        bridgeRacePage.isFBShareBtnDisplayed().then(function(value) {
            expect(value).to.equal(true);
        });
    });

    this.Then(/^I clicks on the expand button$/, function () {
        bridgeRacePage.expandGraph();
    });

    this.Then(/^I see expanded graph in modal dialog$/, function () {
        bridgeRacePage.isGraphModalDisplayed().then(function(value) {
            expect(value).to.equal(true);
        });
    });

    this.Then(/^I see expand button is changed to collapse button$/, function () {
        bridgeRacePage.isCollapseBtnDisplayed().then(function(value) {
            expect(value).to.equal(true);
        });
    });

    this.When(/^I click on collapse button$/, function () {
        bridgeRacePage.collapseGraph();
    });

    this.Then(/^I see graph is collapsed$/, function () {
        bridgeRacePage.isCollapseBtnDisplayed().then(function(value) {
            expect(value).to.equal(true);
        });
    });
};

module.exports = BridgeRaceStepDefinitionsWrapper;