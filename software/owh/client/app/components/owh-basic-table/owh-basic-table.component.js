'use strict';
(function() {
    angular
        .module('owh')
        .component('owhBasicTable', {
            templateUrl: 'app/partials/owhBasicTable.html',
            controller: OWHBasicTableController,
            controllerAs: 'obtc',
            bindings: {
                data: '=',
                headers: '='
            }
        });
    OWHBasicTableController.$inject = [];
    function OWHBasicTableController($scope, utilService, $rootScope) {
    }
}());