'use strict';
(function() {
    angular
        .module('owh.search')
        .component('owhAccordionRow', {
            templateUrl: 'app/modules/search/components/owh-accordion-table/owh-accordion-row/owhAccordionRow.html',
            controller: OWHAccordionRowController,
            controllerAs: 'oarc',
            bindings: {
                data: '<',
                title: '<'
            }
        });
    OWHAccordionRowController.$inject = ['$scope', 'utilService', '$rootScope'];
    function OWHAccordionRowController($scope, utilService, $rootScope) {
        var oarc = this;

    }
}());
