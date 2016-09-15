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
        return element(by.css('.nvd3-svg')).isPresent() &&
               element(by.css('.nv-y.nv-axis')).isPresent() &&
               element(by.css('.nv-x.nv-axis')).isPresent()
    };
    msp.isDataElementsPresent = function(){
       var axis_x_dataElements =  element(by.css('.nv-x.nv-axis.nvd3-svg')).element(by.css('.nvd3.nv-wrap.nv-axis'))
                                    .element(by.css('.tick.zero'));
       var axis_y_dataElements =  element(by.css('.nv-y.nv-axis.nvd3-svg')).element(by.css('.nvd3.nv-wrap.nv-axis'))
                                    .element(by.css('.tick.zero'));

       return axis_x_dataElements.isPresent() && axis_y_dataElements.isPresent();
    };

    msp.getLegends = function () {
       //Get Female & Male radio buttons
       var legends =  element.all(by.css('.nv-legend-text'));
       return legends;
    };

    msp.getSelectedOrUnSelectedLegends = function () {
        //By default Female and Male radio button should be selected
        var legends =  element.all(by.css('.nv-series'));
        var selectedFemaleEle = legends.get(0).$('.nv-legend-symbol').getAttribute('style');
        var selectedMaleEle = legends.get(1).$('.nv-legend-symbol').getAttribute('style');
        //verify unselect functionality by un selecting female radio button
        selectedFemaleEle.click();
        var unSelectedFemaleEle = legends.get(0).$('.nv-legend-symbol').getAttribute('style');
        return [selectedFemaleEle, selectedMaleEle, unSelectedFemaleEle];
    };
};

module.exports = new MortalitySearchPage;