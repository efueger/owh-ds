var chai = require('chai');
var chaiAsPromised = require('chai-as-promised');

chai.use(chaiAsPromised);
var expect = chai.expect;

var yrbsStepDefinitionsWrapper = function () {

    var yrbsPage = require('../support/yrbspage.po')

    this.Given(/^I select YRBS as primary filter$/, function () {
        browser.sleep(300);
        yrbsPage.yrbsOption.click();
        browser.sleep(60000);
    });

    this.When(/^I click on the down arrow at the corner of each category bar$/, function () {
        yrbsPage.getExpandLinks().then(function(elements) {
            elements[0].click();
        })
    });

    this.Then(/^this category must be collapsible$/, function () {
        yrbsPage.getCategoryContents().then(function(elements) {
            expect(elements[0].isDisplayed()).to.eventually.equal(true);
        });
    });

    this.When(/^I click on Show \# More under the questions in any category$/, function () {
        browser.sleep(2000);
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

    this.When(/^I click on 'Show Less'$/, function () {
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
            expect(elements[1].getText()).to.eventually.equal('Show 12 More');
        });
    });

    this.When(/^I hover the mouse over a category name$/, function () {
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

    this.When(/^I click on 'Show only this Category'$/, function () {
        yrbsPage.getShowOnlyLinks().then(function(elements) {
            elements[0].click();
        });
    });

    this.When(/^I click on 'Show all Categories'$/, function () {
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
        var raceFilter = yrbsPage.selectSideFilter("Race/Ethnicity");
        var raceParentElement = raceFilter.element(by.xpath('..')).element(by.xpath('..')).element(by.xpath('..'));
        raceFilter.getAttribute('class').then(function(className){
            if(className =="fa fa-chevron-right") {
                //Exapnd filter
                raceFilter.element(by.xpath('..')).click();
            }
            raceParentElement.element(by.xpath('.//*[.="Asian"]')).click();
        });
        browser.sleep(60000);
        raceFilter.getAttribute('class').then(function(className){
            if(className =="fa fa-chevron-right") {
                //Exapnd filter
                raceFilter.element(by.xpath('..')).click();
            }
            raceParentElement.element(by.xpath('.//*[.="American Indian or Alaska Native"]')).click();
        });
        browser.sleep(60000);
    });

    this.Then(/^the default filter pre\-selected should be Race$/, function () {
        var raceFilter = element(by.className('side-filters')).element(by.xpath('.//*[.="Race/Ethnicity"]'));
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
        expect(allFilters.get(2).getText()).to.eventually.contains("2015");
        //expect(allFilters.get(3).getText()).to.eventually.contains("2013");
        //expect(allFilters.get(4).getText()).to.eventually.contains("2011");
        expect(allFilters.get(3).getText()).to.eventually.contains("Sex");
        expect(allFilters.get(7).getText()).to.eventually.contains("Race");
        expect(allFilters.get(17).getText()).to.eventually.contains("Grade");
        expect(allFilters.get(24).getText()).to.eventually.contains("Question");
    });

    this.Then(/^the data must be right justified in the table$/, function () {
        yrbsPage.getQuestionContent().then(function (elements) {
            expect(elements[0].getCssValue('text-align')).to.eventually.equal('start');
            expect(elements[1].getCssValue('text-align')).to.eventually.equal('right');
        });
    });

    this.Then(/^each question should have chart icon displayed$/, function () {
        element.all(by.className('owh-question__table')).each(function(questionBlock){
            questionBlock.element(by.className('owh-question__question')).all(by.tagName('i')).count().then(function(size){
                expect(size).to.equal(1);
            });
        });
    });

    this.Given(/^filter "([^"]*)" and option "([^"]*)" selected$/, function (filterName, option) {
        var raceFilter = yrbsPage.selectSideFilter(filterName);
        var raceParentElement = raceFilter.element(by.xpath('..')).element(by.xpath('..')).element(by.xpath('..'));
        raceParentElement.element(by.xpath('.//*[.="'+option+'"]')).click();
    });

    this.Then(/^I see question categories in this order "([^"]*)", "([^"]*)", "([^"]*)", "([^"]*)", "([^"]*)", "([^"]*)", "([^"]*)", "([^"]*)"$/, function (questionCat1, questionCat2, questionCat3, questionCat4, questionCat5, questionCat6, questionCat7, questionCat8) {
        browser.sleep(100);
        element(by.id('question')).all(by.tagName('li')).then(function(elements){
            expect(elements[0].getText()).to.eventually.equals(questionCat1);
            expect(elements[1].getText()).to.eventually.equals(questionCat2);
            expect(elements[2].getText()).to.eventually.equals(questionCat3);
            expect(elements[3].getText()).to.eventually.equals(questionCat4);
            expect(elements[4].getText()).to.eventually.equals(questionCat5);
            expect(elements[5].getText()).to.eventually.equals(questionCat6);
            expect(elements[6].getText()).to.eventually.equals(questionCat7);
            expect(elements[7].getText()).to.eventually.equals(questionCat8);
        });
        //close popup
        yrbsPage.closePopup();
    });

    this.When(/^I select "([^"]*)" button$/, function (arg1) {
         element(by.cssContainingText('button', arg1)).click();
    });

    this.Given(/^I expand "([^"]*)" filter section$/, function (arg1) {
        element(by.partialLinkText(arg1)).click();
    });

    this.Then(/^race filter should be labeled Race\/Ethnicity$/, function () {
        element(by.tagName('owh-side-filter')).all(by.className('accordion')).then(function(elements) {
            expect(elements[2].element(by.tagName('a')).getText()).to.eventually.equal('Race/Ethnicity');
        });
    });

    this.When(/^I click on "([^"]*)" button$/, function (arg1) {
        yrbsPage.selectQuestionsButton.click();
    });

    this.Then(/^the pop up box should open up \(just like UCD pop up\) with a list\- tree pattern\- of categories of Survey Questions$/, function () {
        browser.sleep(100);
        expect(element(by.cssContainingText('div', 'Hint: Use Ctrl + Click for multiple selections, or Shift + Click for a range.')).isPresent()).to.eventually.equal(true);
    });

    this.Then(/^it should also have a Search Questions \- search bar above the list$/, function () {
        expect(element(by.id('search_text')).isPresent()).to.eventually.equal(true);
        //close popup
        yrbsPage.closePopup();
    });

    this.When(/^I open up the Survey Question pop up$/, function () {
        yrbsPage.selectQuestionsButton.click();
    });

    this.Then(/^by default no questions should be selected$/, function () {
        //Div with "Filter selected questions" button should be hidden
        expect(element(by.css('[ng-show="tc.selectedNodes.length > 0"]')).getAttribute('aria-hidden')).to.eventually.equal('true');
    });

    this.When(/^I begin to type a word in the search bar$/, function () {
        yrbsPage.searchQuestionsBox.clear().sendKeys('Unintentional');
    });

    this.Then(/^the list below that should be updated dynamically$/, function () {
        //I should see only one question with string 'Unintentional', remaining 7 parent nodes should be hidden
        element(by.id('question')).element(by.tagName('ul')).all(by.className('jstree-hidden')).count().then(function (size) {
            expect(size).to.equal(7);
        });

        //Clear text in search box
        yrbsPage.searchQuestionsBox.clear();
    });


    this.When(/^I hovers his mouse on any of the questions from the list$/, function () {
        browser.actions().mouseMove(element(by.className('jstree-anchor'))).perform();
    });

    this.Then(/^a \+ sign appears in the end of the question to indicate the user that he can click to add the question$/, function () {
        //a + fontawesome icon should be displayed
    });

    this.When(/^I have selected a question$/, function () {
        //select first child question
        element(by.className('jstree-anchor')).click();
    });

    this.Then(/^the \+ sign changes to \- sign to indicate the user that he can click to deselect the question$/, function () {
        //a - fontawesome icon should be displayed beside question

        //and unselect it
        element(by.className('jstree-anchor')).click();
    });


    this.Then(/^another heading \- "([^"]*)" must appear on the top of the 'Search Questions' search bar$/, function (arg1) {
        expect(element(by.cssContainingText('label', arg1)).isPresent()).to.eventually.equal(true);
    });

    this.Then(/^then the selected question must be listed under the Selected Question\(s\)$/, function () {
         expect(element(by.repeater('eachNode in tc.optionValues')).getText()).to.eventually.equal('Unintentional Injuries and Violence');
    });


    this.When(/^I see the selected questions under the Selected Question\(s\) list$/, function () {
        expect(element(by.repeater('eachNode in tc.optionValues')).getText()).to.eventually.equal('Unintentional Injuries and Violence');
    });


    this.Then(/^I should also be able to see a x button to the end of the question$/, function () {
        expect(element(by.id('removeQuestion')).isPresent()).to.eventually.equal(true);
    });

    this.Then(/^I click on this button then that particular question is deleted from the list \(deselected\)$/, function () {
        element(by.id('removeQuestion')).click();
        //No element should present with class 'jstree-clicked'
        element(by.id('question')).element(by.tagName('ul')).all(by.className('jstree-clicked')).count().then(function (size) {
            expect(size).to.equal(0);
        });
    });

    this.When(/^I select a few questions and clicks on the Add Selected Question\(s\) button$/, function () {
        element(by.className('jstree-anchor')).click();
        yrbsPage.addSelectedQuestionsButton.click();
    });

    this.Then(/^the data table should update based on the selection$/, function () {
        //Verify the data table
        var allNodes = element(by.tagName('owh-accordion-table')).all(by.tagName('tr'));
        expect(allNodes.get(1).getText()).to.eventually.contains('Unintentional Injuries and Violence');
        //all other nodes should not display
        //get all tbody in table
        var allTbody = element.all(by.repeater('eachCategory in oatc.data | filter: oatc.filterCategory'));
        //except first tbody, remaining all tbody's should be empty
        for (var index = 1; index < allTbody.length; index++) {
            allTbody.get(index).all(by.tagName('tr')).count().then(function (size) {
                expect(size).to.equal(0);
            })
        }
    });

    this.When(/^I see the selected questions under the Selected Question\(s\) list in side filter$/, function () {
        expect(element(by.repeater('selectedNode in group.selectedNodes')).isPresent()).to.eventually.equal(true);
    });

    this.Then(/^I should also see a "([^"]*)" button at the end of the selected questions list$/, function (arg1) {
        expect(yrbsPage.clearSelectedQuestionsButton.isPresent()).to.eventually.equal(true);
    });

    this.Then(/^I click on this button, then all the selected questions are deleted from the list \(deselected\)$/, function () {
        yrbsPage.clearSelectedQuestionsButton.click();
        browser.sleep(100);
        expect(element(by.repeater('selectedNode in group.selectedNodes')).isPresent()).to.eventually.equal(false);
    });

    this.Then(/^the "([^"]*)" button should be renamed to "([^"]*)"$/, function (selectButton, updateButton) {
        expect(element(by.cssContainingText('button', selectButton)).isPresent()).to.eventually.equal(false);
        expect(element(by.cssContainingText('button', updateButton)).isPresent()).to.eventually.equal(true);
    });
};
module.exports = yrbsStepDefinitionsWrapper;
