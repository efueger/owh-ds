var YRBSSearchPage = function() {
    var ysp = this;

    ysp.yrbsOption = element(by.cssContainingText('option', 'Youth Risk Behavior'));
    ysp.sideFilterUnOrderedList = element(by.css('.side-filters'));

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

    ysp.getShowOnlyLinks = function() {
        return element.all(by.className('owh-question__show-only'));
    };

    ysp.selectSideFilter = function(filterType) {
        var filter = element(by.className('side-filters')).element(by.xpath('.//*[.="'+filterType+'"]'));
        return filter.element(by.xpath('..')).element(by.tagName('i'));
    };

    ysp.getQuestionContent = function() {
        return element.all(by.className('owh-question__content'));
    };
};

module.exports = new YRBSSearchPage;
