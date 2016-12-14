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

    OWHSearchController.$inject = ['utilService', 'searchFactory', '$window', '$location', '$scope'];

    function OWHSearchController(utilService, searchFactory, $window, $location, $scope) {
        var ots = this;
        ots.groupByFiltersUpdated = groupByFiltersUpdated;
        ots.phaseTwoImpl = phaseTwoImpl;
        //Show alert to press Ctrl+D other than Firefox browser
        $scope.bookmarkAlert = function() {
            alert('Press ' + (navigator.userAgent.indexOf('Mac') != -1 ? 'Cmd' : 'Ctrl') + '+D to bookmark this page.');
        };
        var bookmarkButton =angular.element("#bookmark-button");
        //capture currne url and assign it to bookmark button href
        $(bookmarkButton).attr({
            //If we assign $location.absURL() then 'New bookmark window' not displayed, that's why
            //split URL and added as string
            href: "http://owhqa.semanticbits.com"+$location.url()
        });
        //To verify current browser is Firefox browser or not.
        $scope.isFirefoxBrowser = function () {
            return (($window.sidebar && navigator.userAgent.indexOf('Firefox') != -1));
        }
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
