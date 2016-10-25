'use strict';
(function() {
    angular
        .module('owh')
        .component('owhSearch', {
            templateUrl: 'app/components/owh-search/owhSearch.html',
            controller: OWHSearchController,
            controllerAs: 'ots',
            bindings: {
                filters : '=',
                showFilters : '=',
                searchResults : '&',
                onViewFilter: '&',
                tableView: '@'
            }
        });

    OWHSearchController.$inject = ['utilService', 'searchFactory'];

    function OWHSearchController(utilService, searchFactory) {
        var ots = this;
        ots.groupByFiltersUpdated = groupByFiltersUpdated;
        ots.phaseTwoImpl = phaseTwoImpl;
        angular.forEach(ots.showFilters, function(filter) {
            if(filter.key === ots.tableView) {
                ots.selectedShowFilter = filter;
            }
        });

        function groupByFiltersUpdated(added) {
            var selectedFilterKeys = utilService.getValuesByKey(ots.filters.selectedPrimaryFilter.value, 'key');
            angular.forEach(ots.filters.selectedPrimaryFilter.allFilters, function(eachGroupByFilter) {
                if(!eachGroupByFilter.donotshowOnSearch && selectedFilterKeys.indexOf(eachGroupByFilter.key) < 0) {
                    eachGroupByFilter.groupBy = false;
                }
            });
            if(added && utilService.isValueNotEmpty(ots.filters.selectedPrimaryFilter.value)) {
                ots.filters.selectedPrimaryFilter.value[ots.filters.selectedPrimaryFilter.value.length - 1].groupBy =
                    ots.filters.selectedPrimaryFilter.value[ots.filters.selectedPrimaryFilter.value.length - 1].defaultGroup;
            }
            if(ots.filters.selectedPrimaryFilter.initiated) {
                ots.searchResults({});
            }
        }

        /*Show phase two implementation box*/
        function phaseTwoImpl() {
            if(ots.selectedShowFilter.key !== 'number_of_deaths') {
                ots.selectedShowFilter = ots.showFilters[0];
                searchFactory.showPhaseTwoModal('label.show.impl.next');
            }
        }
    }

}());
