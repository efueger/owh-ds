var chai = require('chai');
var chaiAsPromised = require('chai-as-promised');

chai.use(chaiAsPromised);
var expect = chai.expect;

var mortalityStepDefinitionsWrapper = function () {

    var mortalityPage = require('../support/mortalitypage.po')

    this.When(/^user sees a visualization$/, function () {
        mortalityPage.isVisualizationDisplayed().then(function(value) {
            expect(value).to.equal(true);
        });
    });

    this.Then(/^labels are displayed on both the axes for minimized visualization$/, function () {
       var labelArray = mortalityPage.getAxisLabelsForMinimizedVisualization();
       expect(labelArray[0].getText()).to.eventually.equal('Race');
       expect(labelArray[1].getText()).to.eventually.equal('Deaths');
    });

    this.When(/^user expand visualization$/, function () {
        mortalityPage.expandVisualizationLink.click();
    });

    this.Then(/^labels are displayed on both the axes for expanded visualization$/, function () {
        var labelArray = mortalityPage.getAxisLabelsForExpandedVisualization();
        expect(labelArray[0].getText()).to.eventually.equal('Race');
        expect(labelArray[1].getText()).to.eventually.equal('Deaths');
    });

    this.Given(/^user is on search page$/, function () {
        browser.get('/search/');
    });

    this.Then(/^user sees side filter$/, function () {
        browser.sleep(300);
        expect(mortalityPage.sideMenu.isDisplayed()).to.eventually.equal(true);
    });

    this.Then(/^there is button to hide filter$/, function () {
        expect(mortalityPage.hideFiltersBtn.isDisplayed()).to.eventually.equal(true);
    });

    this.When(/^user clicks hide filter button$/, function () {
        mortalityPage.hideFiltersBtn.click();
    });

    this.Then(/^side menu slides away$/, function () {
        expect(mortalityPage.sideMenu.getAttribute('class')).to.eventually.include('ng-hide');
    });

    this.Then(/^user sees button to show filters$/, function () {
        expect(mortalityPage.showFiltersBtn.isDisplayed()).to.eventually.equal(true);
    });

    this.When(/^user clicks show filters button$/, function () {
        mortalityPage.showFiltersBtn.click();
    });

    this.Then(/^side menu slides back into view$/, function () {
        expect(mortalityPage.sideMenu.getAttribute('class')).to.not.eventually.include('ng-hide');
    });

    this.When(/^I see the number of deaths in data table$/, function () {
        mortalityPage.getTableHeaders().then(function(value) {
            expect(value).to.contains('Number of Deaths');
        });
    });

    this.Then(/^the percentages are shown for each row are displayed by default$/, function () {
        mortalityPage.getTableRowData(0).then(function(value){
            expect(value[1]).to.equal('98,841 (45.5%)');
        });
    });

    this.When(/^I update criteria in filter options with column "([^"]*)"$/, function (arg1) {
        mortalityPage.selectSideFilter(arg1, 'Column').click();
    });

    this.Then(/^data table is updated and the number of deaths and percentages are updated too$/, function () {
        mortalityPage.getTableRowData(0).then(function (value) {
            expect(value[1]).to.equal('8,696 (4.0%)');
        });
    });

    this.When(/^I add new data items to row or columns$/, function () {
        mortalityPage.selectSideFilter('Age Groups', 'Row').click();
    });

    this.Then(/^the percentages get re\-calculated based on all the information displayed in a given row$/, function () {
        mortalityPage.getTableRowData(0).then(function(value){
            expect(value[2]).to.equal('86 (18.9%)');
        });
    });

    this.When(/^I see the data table$/, function () {
        expect(mortalityPage.owhTable.isPresent()).to.eventually.equal(true);
        mortalityPage.getTableHeaders().then(function(value) {
            expect(value).to.contains('Number of Deaths');
        });
    });

    this.Then(/^percentages are displayed in the same column\/cell in parenthesis$/, function () {
        mortalityPage.getTableRowData(0).then(function(value){
            expect(value[2]).to.equal('86 (18.9%)');
        });
    });

    this.When(/^I see the quick visualizations$/, function () {
        browser.get('/search');
        mortalityPage.isVisualizationDisplayed().then(function(value) {
            expect(value).to.equal(true);
        });
    });

    this.Then(/^they're displayed same as before and nothing changes$/, function () {
        var labelArray = mortalityPage.getAxisLabelsForMinimizedVisualization();
        expect(labelArray[0].getText()).to.eventually.equal('Race');
        expect(labelArray[1].getText()).to.eventually.equal('Deaths');
        mortalityPage.expandVisualizationLink.click();
        labelArray = mortalityPage.getAxisLabelsForExpandedVisualization();
        expect(labelArray[0].getText()).to.eventually.equal('Race');
        expect(labelArray[1].getText()).to.eventually.equal('Deaths');
    });

   /* this.When(/^I export the data table into excel or csv$/, function () {
        return false;
    });

    this.Then(/^percentages are exported as well$/, function () {
        return false;
    });

    this.Then(/^each percentage is displayed in a separate column \(unlike UI in the application\)$/, function () {
        return false;
    });
*/
    this.When(/^I see the results$/, function () {
        expect(mortalityPage.owhTable.isPresent()).to.eventually.equal(true);
        mortalityPage.getTableHeaders().then(function(value) {
            expect(value).to.contains('Number of Deaths');
        });
    });

    this.Then(/^an option to show\/hide percentages is displayed$/, function () {
        expect(mortalityPage.showOrHidePecentageDiv.isPresent()).to.eventually.equal(true);
        expect(mortalityPage.showPecentageButton.isPresent()).to.eventually.equal(true);
        expect(mortalityPage.hidePecentageButton.isPresent()).to.eventually.equal(true);
    });

    this.Then(/^show\/hide percentages button shouldn't display$/, function () {
        expect(mortalityPage.showOrHidePecentageDiv.isDisplayed()).to.eventually.equal(false);
        expect(mortalityPage.showPecentageButton.isDisplayed()).to.eventually.equal(false);
        expect(mortalityPage.hidePecentageButton.isDisplayed()).to.eventually.equal(false);
    });

    this.Then(/^when that option is toggled, the percentages are either displayed\/hidden$/, function () {
        mortalityPage.hidePecentageButton.click();
        mortalityPage.getTableRowData(0).then(function(value){
            expect(value[2]).to.equal('86');
        });
    });

    /*this.Then(/^this option decides if percentages get exported into the excel\/csv or not$/, function () {
        return false;
    });*/

    this.When(/^I look at the table results$/, function () {
        expect(mortalityPage.owhTable.isPresent()).to.eventually.equal(true);
        mortalityPage.getTableHeaders().then(function(value) {
            expect(value).to.contains('Number of Deaths');
        });
    });

    this.When(/^percentage option is enabled$/, function () {
        mortalityPage.showPecentageButton.click();
    });

    this.Then(/^the Rates and Percentages should have a one decimal precision$/, function () {
        mortalityPage.getTableRowData(0).then(function(value){
            expect(value[2]).to.equal('86 (18.9%)');
        });
    });

    this.When(/^user expands race options$/, function () {
        mortalityPage.raceOptionsLink.click();
    });

    this.When(/^user selects second race option$/, function () {
        mortalityPage.raceOption2Link.click();
    });

    this.Then(/^race options retain their initial ordering$/, function () {
        mortalityPage.getOptions('Race').then(function(elements) {
            elements[3].getOuterHtml().then(function(value) {
                expect(mortalityPage.raceOption2.getOuterHtml()).to.eventually.equal(value);
            });
        });
    });

    this.When(/^I change 'I'm interested in' dropdown value to "([^"]*)"$/, function (arg1) {
        mortalityPage.interestedInSelectBox.element(by.cssContainingText('option', arg1)).click();
    });

    this.Then(/^I should be redirected to YRBS page$/, function () {
        var text = mortalityPage.sideMenu.getText();
        expect(text).to.eventually.contains("Question");
        //expect(text).to.eventually.contains("Select Questions");
        expect(text).to.eventually.contains("Grade");
    });

    this.When(/^the user chooses the option 'Death Rates'$/, function () {
         mortalityPage.deathRatesOption.click();
    });

    this.Then(/^the rates are shown for each row \(with the Total population, from Bridge Race Estimates, as the denominator\) \- and not the total number of deaths shown in the table$/, function () {
        //  mortalityPage.getTableRowData(0).then(function(text){
              //TODO: replace when hooked up to real data
              // expect(text[1]).to.equal('Rate\n885.4\nDeaths\n8,185\nPopulation\n924,416');
        //  });
    });

    this.Then(/^dropdown is in the main search bar$/, function () {
         expect(mortalityPage.mainSearch.element(by.model('ots.selectedShowFilter')).isPresent()).to.eventually.equal(true);
    });

    this.Then(/^the Percentages should have a one decimal precision$/, function () {
          mortalityPage.getTableRowData(1).then(function(text) {
              expect(text[1]).to.equal('338,606 (47.6%)');
          });
    });

    this.Then(/^the following message should be displayed stating that population data is being retrieved from Census "([^"]*)"$/, function (arg1) {
         expect(mortalityPage.deathRateDisclaimer.getText()).to.eventually.equal(arg1);
    });
};
module.exports = mortalityStepDefinitionsWrapper;
