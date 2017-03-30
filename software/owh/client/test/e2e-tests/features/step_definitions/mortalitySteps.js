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

    this.Given(/^I am on search page$/, function () {
        browser.get('/search/');
    });

    this.Then(/^user sees side filter$/, function () {
        browser.sleep(300);
        expect(mortalityPage.sideMenu.isDisplayed()).to.eventually.equal(true);
    });

    this.Then(/^there is button to hide filter$/, function () {
        expect(mortalityPage.hideFiltersBtn.isDisplayed()).to.eventually.equal(true);
    });

    this.When(/^I click hide filter button$/, function () {
        mortalityPage.hideFiltersBtn.click();
    });

    this.Then(/^side menu slides away$/, function () {
        expect(mortalityPage.sideMenu.getAttribute('class')).to.eventually.include('ng-hide');
    });

    this.Then(/^I see button to show filters$/, function () {
        expect(mortalityPage.showFiltersBtn.isDisplayed()).to.eventually.equal(true);
    });

    this.When(/^I click show filters button$/, function () {
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
            expect(value[1]).to.equal('8,565 (45.0%)');
        });
    });

    this.When(/^I update criteria in filter options with column "([^"]*)"$/, function (arg1) {
        mortalityPage.selectSideFilter(arg1, 'Column').click();
    });

    this.When(/^I update criteria in filter option with row "([^"]*)"$/, function (arg1) {
        mortalityPage.selectSideFilter(arg1, 'Row').click();
    });

    this.Then(/^data table is updated and the number of deaths and percentages are updated too$/, function () {
        mortalityPage.getTableRowData(0).then(function (value) {
            expect(value[1]).to.equal('887 (4.7%)');
        });
    });

    this.When(/^I add new data items to row or columns$/, function () {
        mortalityPage.selectSideFilter('Age Groups', 'Row').click();
    });

    this.Then(/^the percentages get re\-calculated based on all the information displayed in a given row$/, function () {
        browser.sleep(300);
        browser.actions().mouseMove(element(by.tagName('owh-table'))).perform();
        mortalityPage.getTableRowData(9).then(function(value){
            expect(value[1]).to.equal('98 (9.4%)');
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
        mortalityPage.getTableRowData(9).then(function(value){
            expect(value[1]).to.equal('98 (9.4%)');
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
        mortalityPage.getTableRowData(9).then(function(value){
            expect(value[1]).to.equal('98');
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
        mortalityPage.getTableRowData(9).then(function(value){
            expect(value[1]).to.equal('98 (9.4%)');
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
        //for first time yrbs page takes time to load but from second time page should load quickly
        //so changed sleep time from 60000 to 300 seconds
        browser.sleep(300);
        var text = mortalityPage.sideMenu.getText();
        expect(text).to.eventually.contains("Question");
        //expect(text).to.eventually.contains("Select Questions");
        expect(text).to.eventually.contains("Grade");
    });

    this.When(/^the user chooses the option 'Death Rates'$/, function () {
        browser.sleep(300);
         mortalityPage.deathRatesOption.click();
    });

    this.Then(/^the rates and population are shown for each row in 'Death Rates' view$/, function () {
        //By default 2015 year is selected
        mortalityPage.getTableRowData(0).then(function(text){
            expect(text[1]).to.equal('Rate\n375.8\nDeaths\n8,565\nPopulation\n2,279,263');
            expect(text[2]).to.equal('Rate\n454.7\nDeaths\n10,451\nPopulation\n2,298,590');
            expect(text[3]).to.equal('Rate\n415.4\nDeaths\n19,016\nPopulation\n4,577,853');

        });
    });

    this.Then(/^dropdown is in the main search bar$/, function () {
         expect(mortalityPage.mainSearch.element(by.model('ots.selectedShowFilter')).isPresent()).to.eventually.equal(true);
    });

    this.Then(/^the Percentages should have a one decimal precision$/, function () {
         //By default 2015 year is selected
          mortalityPage.getTableRowData(0).then(function(text) {
              expect(text[1]).to.equal('8,565 (45.0%)');
              expect(text[2]).to.equal('10,451 (55.0%)');
              expect(text[3]).to.equal('19,016');
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
            expect(value[1]).to.equal('Rate\n557.9\nDeaths\n98,769\nPopulation\n32,250,198');
        });
    });

    this.When(/^user filters by year (\d+)$/, function (arg1) {
        mortalityPage.getOptions('Year').then(function(elements) {
            elements[2015 - arg1 + 2].click();
        });
    });

    this.When(/^user filters by ethnicity Spaniard$/, function () {
        mortalityPage.ethnicitySpaniardOption.click();
    });

    this.Then(/^user should only see total for white race in side filter$/, function () {
        mortalityPage.getSideFilterTotals().then(function(elements) {
            // American Indian
            expect(elements[18].getInnerHtml()).to.eventually.equal('');
            //Asian or Pacific Islander
            expect(elements[19].getInnerHtml()).to.eventually.equal('');
            //Black
            expect(elements[20].getInnerHtml()).to.eventually.equal('');
            //White
            expect(elements[21].getInnerHtml()).to.eventually.equal('608');
        });
    });

    this.When(/^user shows more year filters$/, function () {
        mortalityPage.showMoreYears.click();
    });

    this.When(/^user expands ethnicity filter$/, function () {
        mortalityPage.expandEthnicity.click();
    });

    this.Then(/^ethnicity filters should be in given order$/, function () {
        mortalityPage.getOptions('Ethnicity').then(function(elements) {
            expect(elements[1].getText()).to.eventually.contains('All');
            expect(elements[2].getText()).to.eventually.contains('Non-Hispanic');
            expect(elements[3].getText()).to.eventually.contains('Hispanic');
            expect(elements[4].getText()).to.eventually.contains('Central and South American');
            expect(elements[5].getText()).to.eventually.contains('Central American');
            expect(elements[6].getText()).to.eventually.contains('Cuban');
            expect(elements[7].getText()).to.eventually.contains('Dominican');
            expect(elements[8].getText()).to.eventually.contains('Latin American');
            expect(elements[9].getText()).to.eventually.contains('Mexican');
            expect(elements[10].getText()).to.eventually.contains('Puerto Rican');
            expect(elements[11].getText()).to.eventually.contains('South American');
            expect(elements[12].getText()).to.eventually.contains('Spaniard');
            expect(elements[13].getText()).to.eventually.contains('Other Hispanic');
            expect(elements[14].getText()).to.eventually.contains('Unknown');
        });
    });

    this.Then(/^the age filter should be hidden$/, function () {
        expect(mortalityPage.selectSideFilter('Age Groups', 'Row').isPresent()).to.eventually.equal(false);
    });

    this.Then(/^years should be in descending order$/, function () {
        mortalityPage.getOptions('Year').then(function(elements) {
            expect(elements[1].getText()).to.eventually.contains('All');
            expect(elements[2].getText()).to.eventually.contains('2015');
            expect(elements[3].getText()).to.eventually.contains('2014');
            expect(elements[4].getText()).to.eventually.contains('2013');
            expect(elements[5].getText()).to.eventually.contains('2012');
            expect(elements[6].getText()).to.eventually.contains('2011');
            expect(elements[7].getText()).to.eventually.contains('2010');
            expect(elements[8].getText()).to.eventually.contains('2009');
            expect(elements[9].getText()).to.eventually.contains('2008');
            expect(elements[10].getText()).to.eventually.contains('2007');
            expect(elements[11].getText()).to.eventually.contains('2006');
            expect(elements[12].getText()).to.eventually.contains('2005');
            expect(elements[13].getText()).to.eventually.contains('2004');
            expect(elements[14].getText()).to.eventually.contains('2003');
            expect(elements[15].getText()).to.eventually.contains('2002');
            expect(elements[16].getText()).to.eventually.contains('2001');
            expect(elements[17].getText()).to.eventually.contains('2000');
        });
    });


    this.Then(/^user clicks on "([^"]*)" more link for "([^"]*)" filter$/, function (linkText, filterType) {
        var yearFilter = element(by.cssContainingText('a', filterType)).element(by.xpath('ancestor::label')).element(by.xpath('following-sibling::ul'));
        yearFilter.element(by.cssContainingText('a', linkText)).click();
    });

    this.Then(/^user should see two subcategories\- Hispanic and NonHispanic$/, function () {
        mortalityPage.getOptions('Ethnicity').then(function(elements) {
            expect(elements[2].getText()).to.eventually.contains('Non-Hispanic');
            expect(elements[3].getText()).to.eventually.contains('Hispanic');
        });
    });

    this.When(/^user expands hispanic option group$/, function () {
        mortalityPage.getGroupOptions('Ethnicity').then(function(elements) {
            elements[0].element(by.tagName('i')).click();
        });
    });

    this.When(/^user checks entire Hispanic group$/, function () {
        mortalityPage.ethnicityHispanicOption.click();
    });

    this.Then(/^all Hispanic child options should be checked$/, function () {
        mortalityPage.getOptions('Ethnicity').then(function(elements) {
            for(var i = 3; i < 14; i++) {
                expect(elements[i].element(by.tagName('input')).isSelected()).to.eventually.equal(true);
            }
        });

    });

    this.Then(/^user should see all the of the Hispanic Origin options grouped\(Central American,Cuban,Dominican,Latin American, Mexican, Puerto Rican, South American,Spaniard, Other Hispanic, Unknown\) under one Category\- Hispanic$/, function () {
        mortalityPage.getOptions('Ethnicity').then(function(elements) {
            expect(elements[3].getText()).to.eventually.contains('Hispanic');
            expect(elements[4].getText()).to.eventually.contains('Central and South American');
            expect(elements[5].getText()).to.eventually.contains('Central American');
            expect(elements[6].getText()).to.eventually.contains('Cuban');
            expect(elements[7].getText()).to.eventually.contains('Dominican');
            expect(elements[8].getText()).to.eventually.contains('Latin American');
            expect(elements[9].getText()).to.eventually.contains('Mexican');
            expect(elements[10].getText()).to.eventually.contains('Puerto Rican');
            expect(elements[11].getText()).to.eventually.contains('South American');
            expect(elements[12].getText()).to.eventually.contains('Spaniard');
            expect(elements[13].getText()).to.eventually.contains('Other Hispanic');
        });
    });

    this.When(/^user checks some options under hispanic group$/, function () {
        element(by.id('deaths_hispanicOrigin_Cuban')).element(by.xpath('..')).click();
        browser.sleep(300);
        element(by.id('deaths_hispanicOrigin_Latin American')).element(by.xpath('..')).click();
        browser.sleep(400);
        element(by.id('deaths_hispanicOrigin_Puerto Rican')).element(by.xpath('..')).click();
    });

    this.When(/^user groups ethnicity by row$/, function () {
        mortalityPage.selectSideFilter('Ethnicity', 'Row').click();
    });

    this.Then(/^data should be filtered by the checked hispanic options$/, function () {
        mortalityPage.getTableRowData(0).then(function(text) {
            expect(text[1]).to.equal('Cuban');
        });
        mortalityPage.getTableRowData(1).then(function(text) {
            expect(text[0]).to.equal('Latin American');
        });
        mortalityPage.getTableRowData(2).then(function(text) {
            expect(text[0]).to.equal('Puerto Rican');
        });
    });

    this.Then(/^race options should be in proper order$/, function () {
        mortalityPage.getOptions('Race').then(function(elements) {
            expect(elements[1].getText()).to.eventually.contains('All');
            expect(elements[2].getText()).to.eventually.contains('American Indian');
            expect(elements[3].getText()).to.eventually.contains('Asian or Pacific Islander');
            expect(elements[4].getText()).to.eventually.contains('Black');
            expect(elements[5].getText()).to.eventually.contains('White');
            expect(elements[6].getText()).to.eventually.contains('Other (Puerto Rico only');
        });
    });

    this.Then(/^user expands autopsy filter$/, function () {
        mortalityPage.autopsyOptionsLink.click();
    });

    this.Then(/^autopsy options should be in proper order$/, function () {
        mortalityPage.getOptions('Autopsy').then(function(elements) {
            expect(elements[1].getText()).to.eventually.contains('All');
            expect(elements[2].getText()).to.eventually.contains('Yes');
            expect(elements[3].getText()).to.eventually.contains('No');
            expect(elements[4].getText()).to.eventually.contains('Unknown');
        });
    });

    this.Then(/^filter "([^"]*)" should be displayed$/, function (arg1) {
        expect(element(by.tagName('owh-side-filter')).getText()).to.eventually.contains(arg1);
    });

    this.Then(/^data should be right aligned in table$/, function () {
        mortalityPage.getTableRowDataCells(0).then(function (elements) {
            expect(elements[0].getCssValue('text-align')).to.eventually.equal('start');
            expect(elements[1].getCssValue('text-align')).to.eventually.equal('start');
            expect(elements[2].getCssValue('text-align')).to.eventually.equal('right');
            expect(elements[3].getCssValue('text-align')).to.eventually.equal('right');
        });
        mortalityPage.getTableRowDataCells(1).then(function (elements) {
            expect(elements[0].getCssValue('text-align')).to.eventually.equal('start');
            expect(elements[1].getCssValue('text-align')).to.eventually.equal('right');
            expect(elements[2].getCssValue('text-align')).to.eventually.equal('right');
            expect(elements[3].getCssValue('text-align')).to.eventually.equal('right');
        });
    });

    this.When(/^I choose the option "([^"]*)"$/, function (arg1) {
        mortalityPage.creduDeathRatesOption.click();
    });


    this.Then(/^Rates, Deaths and Population values look as a single data element in the column$/, function () {
        expect(element(by.id('crudeRateDiv')).getAttribute('class')).to.eventually.include('usa-width-one-third');
    });

    this.When(/^I select "([^"]*)" type for "([^"]*)" filter$/, function (type, filter) {
        mortalityPage.selectSideFilter(filter, type).click();
    });

    this.Then(/^Rates, Deaths and Population shouldn't be overlap$/, function () {
        expect(element(by.id('crudeRateDiv')).getAttribute('class')).to.eventually.include('usa-width-one-half');
    });

    this.Then(/^I should see total for Non\-Hispanic$/, function () {
        mortalityPage.getSideFilterTotals().then(function(elements) {
            expect(elements[34].getInnerHtml()).to.eventually.equal('34,926,053');
        });
    });

    this.Then(/^Unknown is disabled\- grayed out$/, function () {
        expect(mortalityPage.ethnicityUnknownOption.element(by.tagName('input')).isEnabled()).to.eventually.equal(false);
    });

    this.When(/^the user selects Unknown$/, function () {
        mortalityPage.ethnicityUnknownOption.click();
    });

    this.Then(/^the rest of the options are disabled\- grayed out$/, function () {
        expect(mortalityPage.ethnicityHispanicOption.element(by.tagName('input')).isEnabled()).to.eventually.equal(false);
        expect(mortalityPage.ethnicityNonHispanicOption.element(by.tagName('input')).isEnabled()).to.eventually.equal(false);
    });

    this.Then(/^zero cells should not have percentage$/, function () {
        mortalityPage.getTableRowDataCells(1).then(function (elements) {
            expect(elements[12].getText()).to.eventually.equal('0');
        });
    });

    this.Then(/^table should not include age groups$/, function () {
        mortalityPage.getTableRowDataCells(0).then(function (elements) {
            expect(elements.length).to.equal(4);
        });
    });

    this.When(/^I select the "([^"]*)" link in application$/, function (bookmarkbtn) {
        mortalityPage.bookmarkButton.click();
    });

    this.Then(/^browser's bookmarking window should be displayed to save the link to Browser$/, function () {
        //verify 'New Bookmark' text appears on bookmark window
        var alertDialog = browser.switchTo().alert();
        expect(alertDialog.getText()).to.eventually.include('HIG Search');
    });

    this.When(/^I hovers on the bookmark link$/, function () {
        browser.actions().mouseMove(mortalityPage.bookmarkButton).perform();
    });

    this.Then(/^the link gets a background box so that I feel it like a button\/action$/, function () {
        //Verify bookmarkbutton css
        expect(mortalityPage.bookmarkButton.getAttribute('class')).to.eventually.include('bookmark-button');
    });

    this.When(/^I selects a saved bookmark$/, function () {
        //Need to find out a way to select saved bookmark
    });

    this.Then(/^all the search parameters should be autopopulated and search results should be displayed$/, function () {
        mortalityPage.isVisualizationDisplayed().then(function(value) {
            expect(value).to.equal(true);
        });
        var labelArray = mortalityPage.getAxisLabelsForMinimizedVisualization();
        expect(labelArray[0].getText()).to.eventually.equal('Race');
        expect(labelArray[1].getText()).to.eventually.equal('Deaths');
        //Verify autocompleted filters and table data also.

    });

    this.Then(/^table should display Hispanic groups only$/, function () {
        mortalityPage.getTableRowDataCells(0).then(function (elements) {
            expect(elements[0].getText()).to.eventually.equal('Hispanic');
        });
        mortalityPage.getTableRowDataCells(5).then(function (elements) {
            expect(elements[0].getText()).to.eventually.equal('Non-Hispanic');
        });
    });

    this.When(/^I choose the option Crude Death Rates$/, function () {
        browser.sleep(3000);
        mortalityPage.deathRatesOption.click();
    });

    this.Then(/^I see Age Groups, Autopsy, Place of Death, Weekday, Month, Underlying Cause of Death, Multiple Causes of Death disabled$/, function () {
        var allElements = element.all(by.css('.cursor-not-allowed')).all(By.css('.filter-display-name'));
        allElements.getText().then(function (filters) {
            filters.forEach(function (filter) {
                expect(['Age Groups','Autopsy','Place of Death', 'Weekday', 'Month',
                    'Underlying Cause of Death', 'Multiple Causes of Death']).to.include(filter);
            });
        });
    });

    this.When(/^I choose the option Age Adjusted Death Rates$/, function () {
        mortalityPage.ageRatesOption.click();
    });

    this.Then(/^I see Ethnicity, Age Groups, Autopsy, Place of Death, Weekday, Month, Underlying Cause of Death, Multiple Causes of Death disabled$/, function () {
        var allElements = element.all(by.css('.cursor-not-allowed')).all(By.css('.filter-display-name'));
        allElements.getText().then(function (filters) {
            filters.forEach(function (filter) {
                expect(['Ethnicity', 'Age Groups','Autopsy','Place of Death', 'Weekday', 'Month',
                    'Underlying Cause of Death', 'Multiple Causes of Death']).to.include(filter);
            })
        });
    });

    this.Then(/^user expands placeOfDeath filter$/, function () {
        mortalityPage.placeOfDeathOptionsLink.click();
    });

    this.Then(/^placeofDeath filter options should be in proper order$/, function () {
        mortalityPage.getOptions('Place of Death').then(function(elements) {
            expect(elements[1].getText()).to.eventually.contains('All');
            expect(elements[2].getText()).to.eventually.contains('Decedent’s home');
            expect(elements[3].getText()).to.eventually.contains('Hospital, clinic or Medical Center- Patient status unknown');
            expect(elements[4].getText()).to.eventually.contains('Hospital, Clinic or Medical Center- Dead on Arrival');
            expect(elements[5].getText()).to.eventually.contains('Hospital, clinic or Medical Center- Inpatient');
            expect(elements[6].getText()).to.eventually.contains('Hospital, Clinic or Medical Center- Outpatient or admitted to Emergency Room');
            expect(elements[7].getText()).to.eventually.contains('Nursing home/long term care');
            expect(elements[8].getText()).to.eventually.contains('Hospice facility');
            expect(elements[9].getText()).to.eventually.contains('Place of death unknown');
            expect(elements[10].getText()).to.eventually.contains('Other');
        });
    });

    this.When(/^user select "([^"]*)" option in "([^"]*)" filter$/, function (arg1, arg2) {
        var filter = element(by.className('side-filters')).element(by.xpath('.//*[.="'+arg2+'"]'));
        var filterParentElement = filter.element(by.xpath('..')).element(by.tagName('i')).element(by.xpath('..')).element(by.xpath('..')).element(by.xpath('..'));
        filterParentElement.element(by.xpath('.//*[.="'+arg1+'"]')).click();
    });

    this.Then(/^data table should display right Number of Deaths$/, function () {
        mortalityPage.getTableRowData(0).then(function(rowdata){
            expect(rowdata[0]).to.equals('American Indian');
            expect(rowdata[3]).to.contains('875');
        });
        mortalityPage.getTableRowData(1).then(function(rowdata){
            expect(rowdata[0]).to.equals('Asian or Pacific Islander');
            expect(rowdata[3]).to.contains('3,100');
        });
        mortalityPage.getTableRowData(2).then(function(rowdata){
            expect(rowdata[0]).to.equals('Black');
            expect(rowdata[3]).to.contains('22,147');
        });
        mortalityPage.getTableRowData(3).then(function(rowdata){
            expect(rowdata[0]).to.equals('White');
            expect(rowdata[3]).to.contains('183,453');
        });
    });

    this.Then(/^I should see Crude Deth Rates page$/, function () {
        expect(mortalityPage.deathRateDisclaimer.getText()).to.eventually.equal("Population details from NCHS Bridged-Race Estimates is used to calculate Death Rates (per 100,000)");
    });

    this.Then(/^I select "([^"]*)" value "([^"]*)"$/, function (arg1, arg2) {
        mortalityPage.getOptions(arg1).then(function(elements) {
            elements[2015 - arg2 + 2].click();
        });
    });

    this.Then(/^I un\-select "([^"]*)" value "([^"]*)"$/, function (arg1, arg2) {
        mortalityPage.getOptions(arg1).then(function(elements) {
            elements[2015 - arg2 + 2].click();
        });
    });

    this.Then(/^data table should display right population count for Crude Death Rates$/, function () {
        mortalityPage.getTableRowData(0).then(function(rowdata){
            expect(rowdata[0]).to.equals('American Indian');
            //Female
            expect(rowdata[1]).to.contains('Rate');
            expect(rowdata[1]).to.contains('346.1');
            expect(rowdata[1]).to.contains('Deaths');
            expect(rowdata[1]).to.contains('5,178');
            expect(rowdata[1]).to.contains('Population');
            expect(rowdata[1]).to.contains('1,496,044');
            //Male
            expect(rowdata[2]).to.contains('Rate');
            expect(rowdata[2]).to.contains('415.6');
            expect(rowdata[2]).to.contains('Deaths');
            expect(rowdata[2]).to.contains('6,185');
            expect(rowdata[2]).to.contains('Population');
            expect(rowdata[2]).to.contains('1,488,106');
            //Number of deaths
            expect(rowdata[3]).to.contains('Rate');
            expect(rowdata[3]).to.contains('380.8');
            expect(rowdata[3]).to.contains('Deaths');
            expect(rowdata[3]).to.contains('11,363');
            expect(rowdata[3]).to.contains('Population');
            expect(rowdata[3]).to.contains('2,984,150');
        });
    });

    this.Then(/^total should be suppressed for all Races except White$/, function () {
        mortalityPage.getTableRowData(0).then(function(rowdata) {
            expect(rowdata[0]).to.equals('American Indian');
            //Ethnicity
            expect(rowdata[1]).to.equals('Spaniard');
            //Female
            expect(rowdata[2]).to.equals('Suppressed');
            //Male
            expect(rowdata[3]).to.equals('11');
            //Number of Deaths
            expect(rowdata[4]).to.equals('Suppressed');
        });
        //Total for American Indian
        mortalityPage.getTableRowData(1).then(function(rowdata) {
            expect(rowdata[0]).to.equals('Total');
            expect(rowdata[1]).to.equals('Suppressed');
        });
        mortalityPage.getTableRowData(2).then(function(rowdata) {
            expect(rowdata[0]).to.equals('Asian or Pacific Islander');
            //Ethnicity
            expect(rowdata[1]).to.equals('Spaniard');
            //Female
            expect(rowdata[2]).to.equals('19');
            //Male
            expect(rowdata[3]).to.equals('Suppressed');
            //Number of Deaths
            expect(rowdata[4]).to.equals('Suppressed');
        });
        //Total for American Indian
        mortalityPage.getTableRowData(3).then(function(rowdata) {
            expect(rowdata[0]).to.equals('Total');
            expect(rowdata[1]).to.equals('Suppressed');
        });
        mortalityPage.getTableRowData(4).then(function(rowdata) {
            expect(rowdata[0]).to.equals('Black');
            //Ethnicity
            expect(rowdata[1]).to.equals('Spaniard');
            //Female
            expect(rowdata[2]).to.equals('Suppressed');
            //Male
            expect(rowdata[3]).to.equals('Suppressed');
            //Number of Deaths
            expect(rowdata[4]).to.equals('Suppressed');
        });
        //Total for American Indian
        mortalityPage.getTableRowData(5).then(function(rowdata) {
            expect(rowdata[0]).to.equals('Total');
            expect(rowdata[1]).to.equals('Suppressed');
        });
        mortalityPage.getTableRowData(6).then(function(rowdata) {
            expect(rowdata[0]).to.equals('White');
            //Ethnicity
            expect(rowdata[1]).to.equals('Spaniard');
            //Female
            expect(rowdata[2]).to.equals('324 (53.3%)');
            //Male
            expect(rowdata[3]).to.equals('284 (46.7%)');
            //Number of Deaths
            expect(rowdata[4]).to.equals('608');
        });
        //Total for American Indian
        mortalityPage.getTableRowData(7).then(function(rowdata) {
            expect(rowdata[0]).to.equals('Total');
            expect(rowdata[1]).to.equals('608');
        });
    });
};
module.exports = mortalityStepDefinitionsWrapper;
