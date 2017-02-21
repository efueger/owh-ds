var NatalitySearchPage = function () {

    var nsp = this;

    nsp.getFilterCategories = function() {
        return element.all(by.className('filter-category'));
    };

    nsp.getVisibleFilters = function (categoryIndex) {
        return element.all(by.css('.category-'+categoryIndex+' li.accordion'));
    };
};


module.exports = new NatalitySearchPage;