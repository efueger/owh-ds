var YRBSSearchPage = function() {
    var ysp = this;

    ysp.yrbsOption = element(by.cssContainingText('option', 'Youth Risk Behavior'));
    ysp.sideFilterUnOrderedList = element(by.className('side-filters'));

    ysp.getCategoryBars = function() {
        return element.all(by.className('owh-question__title'));
    };

    ysp.getCategoryContents = function() {
        return element.all(by.className('owh-question__table'));
    };

    ysp.getShowMoreLinks = function() {
        return element.all(by.className('owh-question__show'));
    };

    ysp.getCategoryQuestions = function() {
        return element.all(by.className('owh-question__question'));
    };

    ysp.getExpandLinks = function() {
        return element.all(by.className('owh-question__title'));
    };

    ysp.selectSideFilter = function(filterType, value) {
        var filter = element(by.className('side-filters')).element(by.text(filterType));
        var iTag = filter.element(by.xpath('..')).element(by.tag('i'));
        if(expect(hasClass(iTag, 'fa-chevron-down')).to.equal(false)) {
            //Exapnd filter
            filter.element(by.xpath('..')).click();
        }
        var filterOption = filter.element(by.text(value));
        return filterOption;
    };
};

module.exports = new YRBSSearchPage;
