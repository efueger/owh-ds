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
                calculateRowTotal: '='
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
        function owhTableDataUpdated() {
            //otc.dataToTable = utilService.prepareGroupedTableData(otc.headers, otc.data, otc.countKey, otc.totalCount, otc.groupCssClass);
            //otc.dataToAccordion = utilService.prepareNestedAccordionData(otc.headers, otc.data, otc.countKey, otc.totalCount, otc.countLabel);
            otc.dataToMixedTable = {};
            if(otc.tableDataPrepared) {
                otc.dataToMixedTable.headers = angular.copy(otc.headers);
                otc.dataToMixedTable.data = angular.copy(otc.data);
            } else {
                otc.dataToMixedTable = utilService.prepareMixedTableData(otc.headers, otc.data, otc.countKey, otc.totalCount, otc.countLabel, otc.calculatePercentage, otc.calculateRowTotal);
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
