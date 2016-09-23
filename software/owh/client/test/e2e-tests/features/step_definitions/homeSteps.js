var chai = require('chai');
var chaiAsPromised = require('chai-as-promised');

chai.use(chaiAsPromised);
var expect = chai.expect;

var homeStepDefinitionsWrapper = function () {

    var homePage = require('../support/homepage.po');
    var mortalityPage = require('../support/mortalitypage.po')

    this.When(/^I hit app url$/, function () {
        browser.get('/');
    });

    this.Then(/^I should be automatically redirected to home page$/, function () {
        browser.getCurrentUrl().then(function(url) {
           expect(url).to.equal(browser.baseUrl);
        });

    });

    this.When(/^I click on Explore button in Quick Health Data Online section$/, function () {
        homePage.quickHealthExploreBtn.click();
    });

    this.Then(/^I should get search page with default filter type mortality$/, function () {
        browser.getCurrentUrl().then(function(url) {
            expect(url).to.equal(browser.baseUrl+"search");
        });
        mortalityPage.getSelectedFilterType().then(function(value){
            expect(value).to.equal("Mortality");
        });
        mortalityPage.getByTypeSelectedFilters().then(function(filterArray){
            expect(filterArray.length).to.equal(2);
        });
    });

    this.When(/^I click on Explore button in Youth Related card under Behavioral Risk$/, function () {
        homePage.mentalExplorerLink.click();
    });

    this.Then(/^I should get search page with default filter type "([^"]*)"$/, function (arg1) {
        browser.getCurrentUrl().then(function(url) {
            expect(url).to.equal(browser.baseUrl+'search');
        });
        mortalityPage.getSelectedFilterType().then(function(value){
            expect(value).to.equal(arg1)
        });
    });

    this.When(/^I click on explore button in Birth card under womens health section$/, function () {
        homePage.birthExplorerLink.click();
    });

    this.Then(/^I should get a info modal$/, function () {
        homePage.getPhaseTwoPopupHeading().then(function(heading){
            expect(heading).to.equal('Work in progress')
        });
    });

    this.When(/^I am at home page$/, function () {
        browser.get("/");
    });

    this.Then(/^gray banner on top reads "([^"]*)"$/, function (message) {
        //Implementation pending
    });

    this.When(/^I am at search page$/, function () {
        //implementation pending
    });
};
module.exports = homeStepDefinitionsWrapper;