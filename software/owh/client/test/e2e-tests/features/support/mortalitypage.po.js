var MortalitySearchPage = function() {
    var msp = this;
    //Filter type select box
    msp.filterTypeSelectBox = element( by.model('ots.filters.selectedPrimaryFilter'));
    msp.chartDataDiv = element(by.repeater('chartData in startChartData'));
    msp.expandVisualizationLink = element(by.css('a[name=expand_graph]'));
    msp.sideMenu = element(by.className('owh-side-menu'));
    msp.hideFiltersBtn = element(by.className('owh-side-menu__handle'));
    msp.showFiltersBtn = element(by.className('owh-side-menu__handle--collapsed'));

    msp.getSelectedFilterType = function() {
       return msp.filterTypeSelectBox.$('option:checked').getText();
    };

    msp.getByTypeSelectedFilters = function() {
        return element.all( by.repeater("$item in $select.selected"));
    };

    msp.isVisualizationDisplayed = function(){
        //Verify visualization css classes present or not
        return element(by.css('.nvd3-svg')).isPresent() &&
               element(by.css('.nv-y.nv-axis')).isPresent() &&
               element(by.css('.nv-x.nv-axis')).isPresent()
    };

    msp.getAxisLabelsForMinimizedVisualization= function () {
        //Verify Visualization has 'nv-axislabel' css class for both axis
        //minimized visualization has id starts with '.chart_'
        var axis_x_label = element(by.id('chart_0_1')).element(by.css('.nvd3.nv-wrap.nv-multiBarHorizontalChart')).element(by.css('.nv-x.nv-axis')).element(by.css('.nv-axislabel'));
        var axis_y_label = element(by.id('chart_0_1')).element(by.css('.nvd3.nv-wrap.nv-multiBarHorizontalChart')).element(by.css('.nv-y.nv-axis')).element(by.css('.nv-axislabel'));
        return [axis_x_label, axis_y_label];
    };
    msp.getAxisLabelsForExpandedVisualization= function () {
        //Verify Visualization has 'nv-axislabel' css class for both axis
        //expanded visualization has id starts with '.chart_expanded_'
        var axis_x_label = element(by.id('chart_expanded_0')).element(by.css('.nvd3.nv-wrap.nv-multiBarHorizontalChart')).element(by.css('.nv-x.nv-axis')).element(by.css('.nv-axislabel'));
        var axis_y_label = element(by.id('chart_expanded_0')).element(by.css('.nvd3.nv-wrap.nv-multiBarHorizontalChart')).element(by.css('.nv-y.nv-axis')).element(by.css('.nv-axislabel'));
        return [axis_x_label, axis_y_label]
    };
};

module.exports = new MortalitySearchPage;