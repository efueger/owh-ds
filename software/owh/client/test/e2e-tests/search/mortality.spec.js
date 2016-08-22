'use strict';

describe('search mortality page', function() {

    var mortalityPage = require('../search/mortalitypage.po');

    beforeEach(function() {
        browser.get('/search');
    });

    it('Mortality default filters verification', function() {
        //check the page url
        expect(browser.getCurrentUrl()).toEqual(browser.baseUrl + "search");

        //check for default filters
        expect(mortalityPage.getSelectedFilterType()).toEqual('Mortality');
        expect(mortalityPage.getByTypeSelectedFilters().count()).toEqual(2);
    });
});