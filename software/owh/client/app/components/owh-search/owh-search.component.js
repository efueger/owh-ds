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

    OWHSearchController.$inject = ['utilService', 'searchFactory', '$window', '$location'];

    function OWHSearchController(utilService, searchFactory, $window, $location) {
        var ots = this;
        ots.groupByFiltersUpdated = groupByFiltersUpdated;
        ots.phaseTwoImpl = phaseTwoImpl;
        ots.bookmarkCurrentUrl = bookmarkCurrentUrl;
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

        /*To bookmark current URL
        * Calling this function from owhSearch.html
        * */
        function bookmarkCurrentUrl($event) {
            var currentURL =  $location.absUrl();
            var title = "Mortality";
            console.log(" navigator ", navigator);
            if ('addToHomescreen' in $window && addToHomescreen.isCompatible) {
                // Mobile browsers
                addToHomescreen({ autostart: false, startDelay: 0 }).show(true);
            } else if ($window.sidebar && $window.sidebar.addPanel) {
                // Firefox <=22
                $window.sidebar.addPanel(title, currentURL, '');
            } else if (($window.sidebar && /Firefox/i.test(navigator.userAgent)) || ($window.opera && $window.print)) {
                // Firefox 23+ and Opera <=14
                $(this).attr({
                    href: currentURL,
                    title: title,
                    rel: 'sidebar'
                }).off($event);
                return true;
            } else if ($window.external && ('AddFavorite' in $window.external)) {
                // IE Favorites
                $window.external.AddFavorite(currentURL, title);
            } else {
                // Other browsers (mainly WebKit & Blink - Safari, Chrome, Opera 15+)
                alert('Press ' + (/Mac/i.test(navigator.userAgent) ? 'Cmd' : 'Ctrl') + '+D to bookmark this page.');
            }

            return false;
        }

    }

}());
