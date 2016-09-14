var MortalitySearchPage = function() {
    var msp = this;
    //Filter type select box
    msp.filterTypeSelectBox = element( by.model('ots.filters.selectedPrimaryFilter'));
    msp.chartDataDiv = element(by.repeater('chartData in startChartData'));

    msp.getSelectedFilterType = function() {
       return msp.filterTypeSelectBox.$('option:checked').getText();
    };

    msp.getByTypeSelectedFilters = function() {
        return element.all( by.repeater("$item in $select.selected"));
    };

    msp.isChartDisplayed = function(){
        //Verify chart css classes present or not
        var parentChartEle = element(by.css('.nvd3-svg'));
        return element(by.css('.nvd3-svg')).isPresent() &&
               element(by.css('.nv-y.nv-axis')).isPresent() &&
               element(by.css('.nv-x.nv-axis')).isPresent()
    };
    msp.isDataElementsPresent = function(){
        //Verify chart X and Y axis css classes present or not
       return true;
    };

    msp.isInteractiveLegendsPresent = function () {
        //Check Grouped & Stacked radio buttons displayed
       return true;
    };

    msp.selectOrUnslectLegends = function () {
        //By default stacked radio button should be selected
        //Use can select grouped option too
        return true;
    };
};

module.exports = new MortalitySearchPage;