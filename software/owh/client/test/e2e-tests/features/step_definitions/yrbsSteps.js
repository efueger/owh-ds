var chai = require('chai');
var chaiAsPromised = require('chai-as-promised');

chai.use(chaiAsPromised);
var expect = chai.expect;

var yrbsStepDefinitionsWrapper = function () {

    var yrbsPage = require('../support/yrbspage.po')

    this.Given(/^user select YRBS as primary filter$/, function () {
        browser.sleep(300);
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

    this.Then(/^each category has two questions in the given order$/, function () {
        yrbsPage.getCategoryQuestions().then(function(elements) {
            expect(elements[0].getText()).to.eventually.contain('Currently Drank Alcohol');
            expect(elements[1].getText()).to.eventually.contain('Currently Used Marijuana');
        });
    });

    this.When(/^I looks at the filter sub categories$/, function () {
        yrbsPage.sideFilterUnOrderedList.all(by.tagName('li')).count().then(function (size) {
             expect(size).to.greaterThan(0);
        });
    });


    this.Then(/^I should be able to select more than one\. The radio buttons must be changed to checkboxes$/, function () {
        var raceFilter = yrbsPage.selectSideFilter("Race");
        var raceParentElement = raceFilter.element(by.xpath('..')).element(by.xpath('..')).element(by.xpath('..'));
        raceFilter.getAttribute('class').then(function(className){
            if(className =="fa fa-chevron-right") {
                //Exapnd filter
                raceFilter.element(by.xpath('..')).click();
            }
            raceParentElement.element(by.xpath('.//*[.="Asian"]')).click();
        });
        raceFilter.getAttribute('class').then(function(className){
            if(className =="fa fa-chevron-right") {
                //Exapnd filter
                raceFilter.element(by.xpath('..')).click();
            }
            raceParentElement.element(by.xpath('.//*[.="American Indian or Alaska Native"]')).click();
        });
    });

    this.Then(/^the default filter pre\-selected should be Race$/, function () {
        var raceFilter = element(by.className('side-filters')).element(by.xpath('.//*[.="Race"]'));
        var raceParentLabel = raceFilter.element(by.xpath('..')).element(by.xpath('..'));
        var columnButton = raceParentLabel.element(by.tagName('owh-toggle-switch')).element(by.tagName('a'));
        expect(columnButton.getAttribute('class')).to.eventually.contains("selected");
    });

    this.Then(/^then table and visualizations adjust to that they use up the entire available screen space$/, function () {
        expect(element(by.className("owh-search-content--expanded")).isPresent()).to.eventually.equal(true);
    });
    this.Then(/^the entire table and visualizations adjust to the reduced screen space$/, function () {
        expect(element(by.className("owh-search-content--expanded")).isPresent()).to.eventually.equal(false);
    });

    this.Given(/^the background highlight is in lighter purple \(button color\)$/, function () {
       element(by.className('owh-side-menu__handle--collapsed')).getCssValue('background-color').then(function(bgColor) {
           // expect(bgColor).to.equal('rgba(246, 246, 246, 1)');
        });
    });

    this.Then(/^filters should be in this order "([^"]*)"$/, function (filters) {
        var allFilters = element(by.css('.side-filters')).all(by.tagName('li'));
        expect(allFilters.get(0).getText()).to.eventually.contains("Year");
        expect(allFilters.get(1).getText()).to.eventually.contains("All");
        expect(allFilters.get(2).getText()).to.eventually.contains("2009");
        expect(allFilters.get(3).getText()).to.eventually.contains("2011");
        expect(allFilters.get(4).getText()).to.eventually.contains("2013");
        expect(allFilters.get(7).getText()).to.eventually.contains("Sex");
        expect(allFilters.get(11).getText()).to.eventually.contains("Race");
        expect(allFilters.get(21).getText()).to.eventually.contains("Grade");
        expect(allFilters.get(28).getText()).to.eventually.contains("Question");
    });

    this.Then(/^each question should have chart icon displayed$/, function () {
        element.all(by.className('owh-question__table')).each(function(questionBlock){
              questionBlock.element(by.className('owh-question__question')).all(by.tagName('i')).count().then(function(size){
                   expect(size).to.equal(1);
              });
        });
    });
};
module.exports = yrbsStepDefinitionsWrapper;
