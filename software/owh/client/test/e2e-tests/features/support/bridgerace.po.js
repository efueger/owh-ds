var BridgeRaceSearchPage = function() {

    var brs = this;
    brs.interestedInSelectBox = element(by.id('interestedIn'));
    brs.sideMenu = element(by.className('owh-side-menu'));
    brs.hideFiltersBtn = element(by.className('owh-side-menu__handle'));
    brs.showFiltersBtn = element(by.className('owh-side-menu__handle--collapsed'));
    brs.owhTable = element(by.tagName('owh-table'));
    brs.sexOptionsLink = element(by.partialLinkText('Sex'));
    brs.expandVisualizationLink = element(by.css('a[name=expand_graph]'));

    brs.getSelectedFilterOptions = function() {
        return element(by.css('.ui-select-match')).all(by.css('.ui-select-match-item')).getText();
    };

    brs.getSelectedFilterType = function() {
        return brs.interestedInSelectBox.$('option:checked').getText();
    };

    brs.getTableHeaders = function() {
        return brs.owhTable.element(by.tagName('table')).element(by.tagName('thead')).all(by.tagName('th')).getText();
    };

    brs.selectRowOrColumn = function(filterType, rowColumnOpt) {
        return element(by.cssContainingText('a', filterType)).element(By.xpath('following-sibling::owh-toggle-switch')).element(by.cssContainingText('a', rowColumnOpt));
    };

    brs.getSubFiltersOfAFilter = function(filterType) {
        return element(by.cssContainingText('a', filterType)).element(by.xpath('ancestor::label')).element(by.xpath('following-sibling::ul')).all(by.tagName('li'));
    };

};

module.exports = new BridgeRaceSearchPage;