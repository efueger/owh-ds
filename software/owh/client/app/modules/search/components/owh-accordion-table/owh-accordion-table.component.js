'use strict';
(function() {
    angular
        .module('owh.search')
        .component('owhAccordionTable', {
            templateUrl: 'app/modules/search/components/owh-accordion-table/owhAccordionTable.html',
            controller: OWHAccordionTableController,
            controllerAs: 'oatc',
            bindings: {
                data: '<',
                headers: '<'
            }
        });
    OWHAccordionTableController.$inject = ['$scope', 'utilService', '$rootScope'];
    function OWHAccordionTableController($scope, utilService, $rootScope) {
        var oatc = this;
        oatc.categoryFilter = null;

        oatc.collapseRow = function(row) {
            row.collapse = true;
        };

        oatc.expandRow = function(row) {
            row.collapse = false;
        };

        oatc.showMore = function(row) {
            row.hide = false;
        };

        oatc.showLess = function(row) {
            row.hide = true;
        };

        oatc.filterCategory = function(value, index, array) {
            if (oatc.categoryFilter == null) {
                return true;
            } else if (value == oatc.categoryFilter) {
                return true;
            } else {
                return false;
            }
        }

        oatc.showOnly = function(category) {
            oatc.categoryFilter = category;
        };

    }
}());
