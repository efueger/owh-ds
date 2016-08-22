var OwhHomepage = function() {

    //explore button in Quick Health Data Online Box
    this.quickHealthExploreBtn = element( by.className('qh-button'));

    //Birth Explore link in Women's Health section
    this.birthExplorerLink = element( by.id('wh_birth_explorer'));

    //Explore link in Youth related under Behavior Risk section
    this.mentalExplorerLink = element( by.id('br_mental_health_explorer'));

    this.getPhaseTwoPopupHeading =  function() {
        return element( by.binding("'label.next.impl' | translate")).getText()
    }
};

module.exports = new OwhHomepage;