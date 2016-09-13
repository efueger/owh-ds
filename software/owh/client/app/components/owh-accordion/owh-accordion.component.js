'use strict';
(function() {
    angular
        .module('owh')
        .component('owhAccordion', {
            templateUrl: 'app/partials/owh-accordion/owhAccordion.html',
            controller: OWHAccordionController,
            controllerAs: 'oac',
            transclude: true,
            bindings: {
                leftTitle : '@',
                rightTitle : '@',
                collapsed: '@',
                id: '@'
            }
        });

    OWHAccordionController.$inject = [];

    function OWHAccordionController() {
        var oac = this;
        oac.toggleAccordion = toggleAccordion;
        function toggleAccordion() {
            oac.collapsed = !oac.collapsed;
        }
    }

}());