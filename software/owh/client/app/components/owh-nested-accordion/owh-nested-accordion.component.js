'use strict';
(function() {
    angular
        .module('owh')
        .component('owhNestedAccordion', {
            templateUrl: 'app/components/owh-nested-accordion/owhNestedAccordion.html',
            controller: OWHNestedAccordionController,
            controllerAs: 'onac',
            bindings: {
                accordionData: '=',
                id: '@'
            }
        });

    OWHNestedAccordionController.$inject = [];

    function OWHNestedAccordionController() {

    }

}());
