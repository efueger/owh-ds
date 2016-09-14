'use strict';
(function() {
    angular
        .module('owh')
        .component('owhBasicTable', {
            templateUrl: 'app/components/owh-basic-table/owhBasicTable.html',
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
