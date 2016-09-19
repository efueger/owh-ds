var MortalitySearchPage = function() {
    var msp = this;
    //Filter type select box
    msp.filterTypeSelectBox = element( by.model('ots.filters.selectedPrimaryFilter'));

    msp.getSelectedFilterType = function() {
       return msp.filterTypeSelectBox.$('option:checked').getText();
    };

    msp.getByTypeSelectedFilters = function() {
        return element.all( by.repeater("$item in $select.selected"));
    };
};

module.exports = new MortalitySearchPage;