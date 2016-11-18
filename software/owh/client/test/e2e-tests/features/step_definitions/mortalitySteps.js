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
        browser.sleep(30000);
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
            expect(value[1]).to.equal('16,104,129 (50.6%)');
        });
    });

    this.When(/^I update criteria in filter options with column "([^"]*)"$/, function (arg1) {
        mortalityPage.selectSideFilter(arg1, 'Column').click();
    });

    this.Then(/^data table is updated and the number of deaths and percentages are updated too$/, function () {
        mortalityPage.getTableRowData(0).then(function (value) {
            expect(value[1]).to.equal('570,547 (1.8%)');
        });
    });

    this.When(/^I add new data items to row or columns$/, function () {
        mortalityPage.selectSideFilter('Age Groups', 'Row').click();
    });

    this.Then(/^the percentages get re\-calculated based on all the information displayed in a given row$/, function () {
        browser.actions().mouseMove(element(by.tagName('owh-table'))).perform();
        mortalityPage.getTableRowData(0).then(function(value){
            expect(value[2]).to.equal('34,048 (11.1%)');
        });
    });

    this.When(/^I see the data table$/, function () {
        expect(mortalityPage.owhTable.isPresent()).to.eventually.equal(true);
        mortalityPage.getTableHeaders().then(function(value) {
            expect(value).to.contains('Number of Deaths');
        });
    });

    this.Then(/^percentages are displayed in the same column\/cell in parenthesis$/, function () {
        browser.actions().mouseMove(element(by.tagName('owh-table'))).perform();
        mortalityPage.getTableRowData(0).then(function(value){
            expect(value[2]).to.equal('34,048 (11.1%)');
        });
    });

    this.When(/^I see the quick visualizations$/, function () {
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
            expect(value[2]).to.equal('34,048');
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
            expect(value[2]).to.equal('34,048 (11.1%)');
        });
    });

    this.When(/^user expands race options$/, function () {
        browser.sleep(30000);
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
        browser.sleep(30000);
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
              expect(text[1]).to.equal('2,150,095 (49.1%)');
          });
    });

    this.Then(/^the following message should be displayed stating that population data is being retrieved from Census "([^"]*)"$/, function (arg1) {
         expect(mortalityPage.deathRateDisclaimer.getText()).to.eventually.equal(arg1);
    });

    this.When(/^the user chooses the option 'Age Adjusted Death Rates'$/, function () {
        mortalityPage.ageRatesOption.click();
    });

    this.Then(/^the age adjusted rates are shown for each row$/, function () {
        mortalityPage.getTableRowData(0).then(function(value){
            expect(value[1]).to.equal('Rate\n662.5\nDeaths\n16,104,129\nPopulation\n1,943,803,096');
        });
    });

    this.When(/^user filters by year (\d+)$/, function (arg1) {
        mortalityPage.getOptions('Year').then(function(elements) {
            elements[2014 - arg1 + 1].click();
        });
    });

    this.When(/^user filters by ethnicity Spaniard$/, function () {
        mortalityPage.ethnicitySpaniardOption.click();
    });

    this.Then(/^user should only see total for white race in side filter$/, function () {
        mortalityPage.getSideFilterTotals().then(function(elements) {
            expect(elements[18].getInnerHtml()).to.eventually.equal('611');
            expect(elements[19].getInnerHtml()).to.eventually.equal('');
            expect(elements[20].getInnerHtml()).to.eventually.equal('');
        });
    });

    this.When(/^user shows more year filters$/, function () {
        mortalityPage.showMoreYears.click();
    });

    this.When(/^user shows more ethnicity filter$/, function () {
        mortalityPage.showMoreEthnicity.click();
    });

    this.When(/^user expands ethnicity filter$/, function () {
        mortalityPage.expandEthnicity.click();
    });

    this.Then(/^ethnicity filters should be in given order$/, function () {
        mortalityPage.getOptions('Ethnicity').then(function(elements) {
            expect(elements[1].getText()).to.eventually.contains('Non-Hispanic');
            expect(elements[2].getText()).to.eventually.contains('Central and South American');
            expect(elements[3].getText()).to.eventually.contains('Central American');
            expect(elements[4].getText()).to.eventually.contains('Cuban');
            expect(elements[5].getText()).to.eventually.contains('Dominican');
            expect(elements[6].getText()).to.eventually.contains('Latin American');
            expect(elements[7].getText()).to.eventually.contains('Mexican');
            expect(elements[8].getText()).to.eventually.contains('Puerto Rican');
            expect(elements[9].getText()).to.eventually.contains('South American');
            expect(elements[10].getText()).to.eventually.contains('Spaniard');
            expect(elements[11].getText()).to.eventually.contains('Other Hispanic');
            expect(elements[12].getText()).to.eventually.contains('Unknown');
        });
    });

    this.Then(/^the age filter should be hidden$/, function () {
        expect(mortalityPage.selectSideFilter('Age Groups', 'Row').isDisplayed()).to.eventually.equal(false);
    });

    this.Then(/^years should be in descending order$/, function () {
        mortalityPage.getOptions('Year').then(function(elements) {
            expect(elements[0].getText()).to.eventually.contains('All');
            expect(elements[1].getText()).to.eventually.contains('2014');
            expect(elements[2].getText()).to.eventually.contains('2013');
            expect(elements[3].getText()).to.eventually.contains('2012');
            expect(elements[4].getText()).to.eventually.contains('2011');
            expect(elements[5].getText()).to.eventually.contains('2010');
            expect(elements[6].getText()).to.eventually.contains('2009');
            expect(elements[7].getText()).to.eventually.contains('2008');
            expect(elements[8].getText()).to.eventually.contains('2007');
            expect(elements[9].getText()).to.eventually.contains('2006');
            expect(elements[10].getText()).to.eventually.contains('2005');
            expect(elements[11].getText()).to.eventually.contains('2004');
            expect(elements[12].getText()).to.eventually.contains('2003');
            expect(elements[13].getText()).to.eventually.contains('2002');
            expect(elements[14].getText()).to.eventually.contains('2001');
            expect(elements[15].getText()).to.eventually.contains('2000');
        });
    });


    this.Then(/^user clicks on "([^"]*)" more link for "([^"]*)" filter$/, function (linkText, filterType) {
        var yearFilter = element(by.cssContainingText('a', filterType)).element(by.xpath('ancestor::label')).element(by.xpath('following-sibling::ul'));
        yearFilter.element(by.cssContainingText('a', linkText)).click();
    });

    this.Then(/^race options should be in proper order$/, function () {
        mortalityPage.getOptions('Race').then(function(elements) {
            expect(elements[0].getText()).to.eventually.contains('All');
            expect(elements[1].getText()).to.eventually.contains('White');
            expect(elements[2].getText()).to.eventually.contains('Black');
            expect(elements[3].getText()).to.eventually.contains('American Indian');
            expect(elements[4].getText()).to.eventually.contains('Asian or Pacific Islander');
            expect(elements[5].getText()).to.eventually.contains('Other (Puerto Rico only');
        });
    });

    this.Then(/^user expands autopsy filter$/, function () {
        mortalityPage.autopsyOptionsLink.click();
    });

    this.Then(/^autopsy options should be in proper order$/, function () {
        mortalityPage.getOptions('Autopsy').then(function(elements) {
            expect(elements[0].getText()).to.eventually.contains('All');
            expect(elements[1].getText()).to.eventually.contains('Yes');
            expect(elements[2].getText()).to.eventually.contains('No');
            expect(elements[3].getText()).to.eventually.contains('Unknown');
        });
    });
};
module.exports = mortalityStepDefinitionsWrapper;
