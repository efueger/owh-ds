var BridgeRaceSearchPage = function() {

    var brs = this;
    brs.interestedInSelectBox = element(by.id('interestedIn'));
    brs.sideMenu = element(by.className('owh-side-menu'));
    brs.hideFiltersBtn = element(by.className('owh-side-menu__handle'));
    brs.showFiltersBtn = element(by.className('owh-side-menu__handle--collapsed'));
    brs.owhTable = element(by.tagName('owh-table'));
    brs.sexOptionsLink = element(by.partialLinkText('Sex'));
    brs.expandGraphLink = element(by.css('a[name=expand_graph]'));
    brs.collapseGraphLink = element(by.name('close'));

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

    brs.isVisualizationDisplayed = function(){
        return element(by.css('.nvd3-svg')).isPresent() &&
            element(by.css('.nv-y.nv-axis')).isPresent() &&
            element(by.css('.nv-x.nv-axis')).isPresent()
    };

    brs.isChartDataDisplayed = function(){
        var bars = element.all(by.css('.nv-bar'));
        return bars
    };

    brs.getGraphTitle = function(){
        return element.all(by.css('.graph-title'));
    };

    brs.getAxisLabelsForAGraph = function(index){
        var xAxisLabel = element(by.id('chart_0_'+index)).element(by.css('.nv-multiBarWithLegend'))
            .element(by.css('.nv-x')).element(by.css('.nv-axislabel'));
        var yAxisLabel = element(by.id('chart_0_'+index)).element(by.css('.nv-multiBarWithLegend'))
            .element(by.css('.nv-y')).element(by.css('.nv-axislabel'));
        return [xAxisLabel, yAxisLabel];
    };

    brs.isExpandBtnDisplayed = function () {
        return element(by.name('expand_graph')).isPresent();
    };

    brs.isFBShareBtnDisplayed = function () {
        return element(by.name('share_fb')).isPresent();
    };

    brs.isCollapseBtnDisplayed = function () {
        return brs.collapseGraphLink.isPresent();
    };

    brs.isGraphModalDisplayed = function () {
        return element(by.id('custom-modal')).isPresent();
    };

    brs.expandGraph = function () {
        return brs.expandGraphLink.click();
    };

    brs.collapseGraph = function () {
        return brs.collapseGraphLink.click();
    };

    brs.selectFilterSwitch = function(filter, switchType) {
        return element(by.cssContainingText('a', filter)).element(By.xpath('following-sibling::owh-toggle-switch')).element(by.cssContainingText('a', switchType));
    };
};

module.exports = new BridgeRaceSearchPage;