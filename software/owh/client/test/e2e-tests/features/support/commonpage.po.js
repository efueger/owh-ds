var CommonPage = function() {
    var msp = this;
    msp.backButton = element(by.css('button[title="Previous Query"]'));
    msp.forwardButton = element(by.css('button[title="Next Query"]'));
};

module.exports = new CommonPage;
