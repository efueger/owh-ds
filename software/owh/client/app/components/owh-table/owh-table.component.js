'use strict';
(function() {
    angular
        .module('owh')
        .component('owhTable', {
            templateUrl: 'app/components/owh-table/owhTable.html',
            controller: OWHTableController,
            controllerAs: 'otc',
            bindings: {
                data: '=',
                headers: '=',
                countKey: '@',
                countLabel: '@',
                totalCount: '@',
                groupCssClass: '@',
                tableDataPrepared: '=',
                calculatePercentage: '=',
                calculateRowTotal: '=',
                secondaryCountKey: '@',
                tableView: '@'
            }
        });
    OWHTableController.$inject = ['$scope', 'utilService', '$rootScope'];
    function OWHTableController($scope, utilService, $rootScope) {
        var otc = this;
        //otc.toggle = toggle;
        $scope.$watch('otc.data', function(newValue, oldValue) {
            if(newValue !== oldValue) {
                owhTableDataUpdated();
            }
        });
        $scope.$watch('otc.calculatePercentage', function(newValue, oldValue) {
            if(newValue !== oldValue) {
                owhTableDataUpdated();
            }
        });
        function owhTableDataUpdated() {
            //otc.dataToTable = utilService.prepareGroupedTableData(otc.headers, otc.data, otc.countKey, otc.totalCount, otc.groupCssClass);
            //otc.dataToAccordion = utilService.prepareNestedAccordionData(otc.headers, otc.data, otc.countKey, otc.totalCount, otc.countLabel);
            otc.dataToMixedTable = {};
            if(otc.tableDataPrepared) {
                otc.dataToMixedTable.headers = angular.copy(otc.headers);
                otc.dataToMixedTable.data = angular.copy(otc.data);
            } else {
                //TODO: we can construct the mixedTable object outside of this component and just pass it in, allows for more flexibility and simpler component interface
                otc.dataToMixedTable = utilService.prepareMixedTableData(otc.headers, otc.data, otc.countKey, otc.totalCount, otc.countLabel, otc.calculatePercentage, otc.calculateRowTotal, otc.secondaryCountKey);
            }
        }
        owhTableDataUpdated();

        //function toggle($event, cssClass) {
        //    var $parentRow = jQuery($event.currentTarget);
        //    var $rows = jQuery(document.getElementsByClassName(cssClass));
        //    if($rows.is(':visible')){
        //        $rows.hide();
        //        $parentRow.removeClass('fa-angle-down');
        //        $parentRow.addClass('fa-angle-right');
        //    } else {
        //        $rows.show();
        //        $parentRow.removeClass('fa-angle-right');
        //        $parentRow.addClass('fa-angle-down');
        //    }
        //}
    }
}());
