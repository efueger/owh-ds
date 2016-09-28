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
        browser.get('/search');
    });

    this.Then(/^user sees side filter$/, function () {
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
        return false;
    });

    this.Then(/^the percentages are shown for each row are displayed by default$/, function () {
        return false;
    });

    this.When(/^I update criteria in filter options$/, function () {
        return false;
    });

    this.Then(/^data table is updated and the number of deaths and percentages are updated too$/, function () {
        return false;
    });

    this.When(/^I add new data items to row or columns$/, function () {
        return false;
    });

    this.Then(/^the percentages get re\-calculated based on all the information displayed in a given row$/, function () {
        return false;
    });

    this.When(/^I see the data table$/, function () {
        return false;
    });

    this.Then(/^percentages are displayed in the same column\/cell in parenthesis$/, function () {
        return false;
    });

    this.When(/^I see the quick visualizations$/, function () {
        return false;
    });

    this.Then(/^they're displayed same as before and nothing changes$/, function () {
        return false;
    });

    this.When(/^I export the data table into excel or csv$/, function () {
        return false;
    });

    this.Then(/^percentages are exported as well$/, function () {
        return false;
    });

    this.Then(/^each percentage is displayed in a separate column \(unlike UI in the application\)$/, function () {
        return false;
    });

    this.When(/^I see the results$/, function () {
        return false;
    });

    this.Then(/^an option to view\/hide percentages is displayed$/, function () {
        return false;
    });

    this.Then(/^when that option is toggled, the percentages are either displayed\/hidden$/, function () {
        return false;
    });

    this.Then(/^this option decides if percentages get exported into the excel\/csv or not$/, function () {
        return false;
    });

    this.When(/^the I look at the table results$/, function () {
        return false;
    });

    this.Then(/^the Rates and Percentages should have a one decimal precision$/, function () {
        return false;
    });
};
module.exports = mortalityStepDefinitionsWrapper;
