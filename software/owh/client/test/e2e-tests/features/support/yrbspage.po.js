var YRBSSearchPage = function() {
    var ysp = this;

    ysp.yrbsOption = element(by.cssContainingText('option', 'Youth Risk Behavior'));

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
        return element.all(by.className('owh-question__expand'));
    };

};

module.exports = new YRBSSearchPage;
