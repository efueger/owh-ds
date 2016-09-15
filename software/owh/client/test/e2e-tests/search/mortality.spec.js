'use strict';

describe('search mortality page', function() {

    var mortalityPage = require('../search/mortalitypage.po');

    beforeEach(function() {
        browser.get('/search');
        jasmine.DEFAULT_TIMEOUT_INTERVAL = 50000;
    });

    it('Mortality default filters verification', function() {
        //check the page url
        expect(browser.getCurrentUrl()).toEqual(browser.baseUrl + "search");

        //check for default filters
        expect(mortalityPage.getSelectedFilterType()).toEqual('Mortality');
        expect(mortalityPage.getByTypeSelectedFilters().count()).toEqual(2);
    });

    it('User sees a visualization - Chart', function(){
        //Check if chart displayed on search page
        expect(mortalityPage.chartDataDiv).not.toBeNull();
        expect(mortalityPage.isChartDisplayed()).toEqual(true);
    });

    it('Data element and values are plotted on both the axes', function () {
        //check data elements present on X and Y axis
        expect(mortalityPage.isDataElementsPresent()).toEqual(true);
    });

    it('An interactive legend is displayed on the graph', function () {
        //Check 'Female' and 'Male'(By default mortality has Race, Gender filter)
        // radio buttons are displayed
        var legends = mortalityPage.getLegends();
        expect(legends.get(0).getText()).toEqual('Female');
        expect(legends.get(1).getText()).toEqual('Male');
    });

    it('And then user can select/unselect options to change data displayed on the graph', function(){
        //User can select/unselect legends
        var legends = mortalityPage.getSelectedOrUnSelectedLegends();
        expect(legends[0]).toContain('fill-opacity: 1') //By default Female radio button should be selected
        expect(legends[1]).toContain('fill-opacity: 1') //By default Male radio button should be selected
        expect(legends[2]).toContain('fill-opacity: 0') //Un select Female radio button
    });
});