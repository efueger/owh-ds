'use strict';
(function() {
    angular
        .module('owh')
        .component('owhGraph', {
            templateUrl: 'app/components/owh-graph/owhGraph.html',
            controller: OWHGraphController,
            controllerAs: 'ogc',
            bindings: {
                graphData: '<',
                showMap: '<',
                maps: '<',
                selectedMapSize: '@'
            }
        });
    OWHGraphController.$inject = ['$scope', '$rootScope'];
    function OWHGraphController($scope, $rootScope) {
        var ogc = this;
    }
}());