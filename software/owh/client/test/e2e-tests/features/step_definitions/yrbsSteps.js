var chai = require('chai');
var chaiAsPromised = require('chai-as-promised');

chai.use(chaiAsPromised);
var expect = chai.expect;

var yrbsStepDefinitionsWrapper = function () {

    var yrbsPage = require('../support/yrbspage.po')

    this.Given(/^user select YRBS as primary filter$/, function () {
        yrbsPage.yrbsOption.click();
    });

    this.When(/^the user clicks on the down arrow at the corner of each category bar$/, function () {
        yrbsPage.getExpandLinks().then(function(elements) {
            elements[0].click();
        })
    });

    this.Then(/^this category must be collapsible$/, function () {
        yrbsPage.getCategoryContents().then(function(elements) {
            expect(elements[0].isDisplayed()).to.eventually.equal(true);
        });
    });

    this.When(/^the user clicks on Show \# More under the questions in any category$/, function () {
        yrbsPage.getShowMoreLinks().then(function(elements){
            elements[1].click();
        });
    });

    this.Then(/^the category should expand to show all the questions$/, function () {
        yrbsPage.getCategoryQuestions().then(function(elements) {
            expect(elements[6].isDisplayed()).to.eventually.equal(true);
        });
    });

    this.Then(/^'Show \# More' should be replaced with 'Show Less'$/, function () {
        expect(yrbsPage.getShowMoreLinks().get(1).getText()).to.eventually.equal('Show Less');
    });

    this.When(/^the user clicks on 'Show Less'$/, function () {
        yrbsPage.getShowMoreLinks().then(function(elements){
            browser.sleep(300);
            elements[1].click();
        });
    });

    this.Then(/^the category to reset back to the original view of the two questions$/, function () {
        yrbsPage.getCategoryQuestions().then(function(elements) {
            expect(elements[9].getAttribute('class')).to.eventually.include('ng-hide');
        });
    });

    this.Then(/^'Show Less' should be replaced with 'Show \# More'$/, function () {
        yrbsPage.getShowMoreLinks().then(function(elements) {
            expect(elements[1].getText()).to.eventually.equal('Show 10 More');
        });
    });

    this.When(/^the user hovers the mouse over a category name$/, function () {
        yrbsPage.getExpandLinks().then(function(elements) {
            browser.actions().mouseMove(elements[0]).perform();
        });
    });

    this.Then(/^an option\/link to 'Show only this Category' should be seen$/, function () {
        yrbsPage.getShowOnlyLinks().then(function(elements) {
            expect(elements[0].isDisplayed()).to.eventually.equal(true);
            expect(elements[0].getText()).to.eventually.equal('Show only this category');
        });
    });

    this.When(/^the user clicks on 'Show only this Category'$/, function () {
        yrbsPage.getShowOnlyLinks().then(function(elements) {
            elements[0].click();
        });
    });

    this.Then(/^the data table must show only that category$/, function () {
        yrbsPage.getExpandLinks().then(function(elements) {
            expect(elements[0].isDisplayed()).to.eventually.equal(true);
            expect(elements.length).to.equal(1);
        });
    });

    this.Then(/^an option\/link to 'Show all Categories' should be seen$/, function () {
        yrbsPage.getShowOnlyLinks().then(function(elements) {
            expect(elements[0].isDisplayed()).to.eventually.equal(true);
            expect(elements[0].getText()).to.eventually.equal('Show all categories');
        });
    });

    this.Then(/^the data table should show all categories$/, function () {
        yrbsPage.getExpandLinks().then(function(elements) {
            expect(elements[0].isDisplayed()).to.eventually.equal(true);
            expect(elements[1].isDisplayed()).to.eventually.equal(true);
            expect(elements.length).to.be.above(1);
        });
    });

    this.When(/^I looks at the filter sub categories$/, function () {
        expect(yrbsPage.sideFilterUnOrderedList.getAttribute("li").length).to.eventually.greaterThan(0);
    });


    this.Then(/^I should be able to select more than one\. The radio buttons must be changed to checkboxes$/, function () {
        yrbsPage.selectSideFilter("Race", "Asian").click();
        yrbsPage.selectSideFilter("Race", "American Indian or Alaska Native").click();
    });

    this.Then(/^the default filter pre\-selected should be Race$/, function () {
        var RaceFilter = element(by.className('side-filters')).element(by.text('Race'));
        var columnButton = RaceFilter.element(by.tag('owh-toggle-switch')).element(by.tag('a'));
        expect(hasClass(columnButton, 'selected')).to.equal(true);
    });

    this.Then(/^then table and visualizations adjust to that they use up the entire available screen space$/, function () {
        expect(element(by.css("owh-search-content--expanded")).isPresent()).to.eventually.equal(true);
    });
    this.Then(/^the entire table and visualizations adjust to the reduced screen space$/, function () {
        expect(element(by.css("owh-search-content--expanded")).isPresent()).to.eventually.equal(false);
    });

    this.Given(/^the background highlight is in lighter purple \(button color\)$/, function () {
        element(by.className('owh-side-menu__handle--collapsed')).getCssValue('background-color').then(function(bgColor) {
            expect(bgColor).toEqual('#F6F6F6');
        });
    });

};
module.exports = yrbsStepDefinitionsWrapper;
