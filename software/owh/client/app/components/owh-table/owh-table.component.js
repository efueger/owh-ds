'use strict';
(function() {
    angular
        .module('owh')
        .component('owhTable', {
            templateUrl: 'app/components/owh-table/owhTable.html',
            controller: OWHTableController,
            controllerAs: 'otc',
            bindings: {
                tableData: '<',
                tableView: '@',
                showPercentage: '<'
            }
        });
    OWHTableController.$inject = ['$scope', 'utilService', '$rootScope'];
    function OWHTableController($scope, $rootScope) {
        var otc = this;
    }
}());
