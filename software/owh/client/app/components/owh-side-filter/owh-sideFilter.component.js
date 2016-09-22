'use strict';
(function(){
    angular
        .module('owh')
        .component("owhSideFilter",{
            templateUrl: 'app/components/owh-side-filter/owhSideFilter.html',
            controller: sideFilterController,
            controllerAs: 'sfc',
            bindings:{
                filters : "=",
                //array of filter keys, specifies order
                sort: '<'
            }
        });

    sideFilterController.$inject=['ModalService', 'utilService', 'searchFactory'];

    function sideFilterController(ModalService, utilService, searchFactory){
        var sfc = this;
        sfc.groupBySideFilter = groupBySideFilter;
        sfc.getOptionCountPercentage = getOptionCountPercentage;
        sfc.getOptionCount = getOptionCount;
        sfc.showModal = showModal;
        sfc.clearSelection = clearSelection;
        sfc.updateGroupValue = updateGroupValue;
        sfc.search = search;
        sfc.getFilterOrder = getFilterOrder;

        //Filters based on side filters
        function groupBySideFilter(group) {
            if(group.filters) {
                angular.forEach(group.filters, function(eachFilter) {
                    eachFilter.groupBy = group.groupBy;
                    addOrFilterToPrimaryFilterValue(eachFilter, sfc.filters.selectedPrimaryFilter);
                });
            } else {
                addOrFilterToPrimaryFilterValue(group, sfc.filters.selectedPrimaryFilter);
            }
            search();
        }
        function addOrFilterToPrimaryFilterValue(filter, primaryFilter) {
            var filterIndex = utilService.findIndexByKeyAndValue(sfc.filters.selectedPrimaryFilter.value, 'key', filter.key);
            if(filter.groupBy && filterIndex < 0) {
                primaryFilter.value.push(filter);
            } else if(!filter.groupBy && filterIndex >= 0) {
                primaryFilter.value.splice(filterIndex, 1);
            }
        }

        function search() {
            if(sfc.filters.selectedPrimaryFilter.initiated) {
                sfc.filters.selectedPrimaryFilter.searchResults(sfc.filters.selectedPrimaryFilter);
            }
        }

        function getOptionCountPercentage(option) {
            var countKey = sfc.filters.selectedPrimaryFilter.key;
            var countPercentKey = countKey + 'Percentage';
            return option && option[countPercentKey] ? option[countPercentKey] : 0
        }

        function getOptionCount(option) {
            var countKey = sfc.filters.selectedPrimaryFilter.key;
            return option && option[countKey] ? option[countKey] : 0
        }

        function showModal(selectedFilter, allFilters) {
            angular.forEach(allFilters, function(eachFilter) {
                if (eachFilter.key !== selectedFilter.key){
                    clearSelection(eachFilter)
                }
            });
            var showTree = selectedFilter.key ==='ucd-chapter-10' || selectedFilter.key === 'question';
            if(!showTree) {
                searchFactory.showPhaseTwoModal('label.mcd.impl.next');
            }else {
                // Just provide a template url, a controller and call 'showModal'.
                ModalService.showModal({
                    templateUrl: "app/partials/owhModal.html",
                    controllerAs: 'mc',
                    controller: function ($scope, close) {
                        var mc = this;
                        mc.codeKey = selectedFilter.key;
                        mc.entityName = selectedFilter.key === 'question' ? 'Question' : 'Disease';
                        mc.modelHeader = selectedFilter.key === 'question' ? 'label.select.question' : 'label.cause.death';
                        mc.optionValues = selectedFilter.selectedValues;
                        mc.close = close;
                    }
                }).then(function (modal) {
                    // The modal object has the element built, if this is a bootstrap modal
                    // you can call 'modal' to show it, if it's a custom modal just show or hide
                    // it as you need to.
                    modal.element.show();
                    modal.close.then(function (result) {
                        //remove all elements from array
                        if(!selectedFilter.selectedValues) {
                            selectedFilter.selectedValues = [];
                        }
                        selectedFilter.selectedValues.length = 0;
                        //To reflect the selected causes
                        angular.forEach(modal.controller.optionValues, function (eachOption, index) {
                            selectedFilter.selectedValues.push(eachOption);
                        });
                        selectedFilter.value = utilService.getValuesByKey(selectedFilter.selectedValues, 'id');
                        modal.element.hide();
                        search();
                    });
                });
            }
        }

        function clearSelection(filter, resetGroupBy) {
            if(resetGroupBy) {
                filter.groupBy = false;
            }
            //remove all elements from array
            filter.selectedValues.length = 0;
            filter.value.length = 0;
            search();
        }

        //remove all elements from array for all select
        function updateGroupValue(group) {
            if ( group.allChecked === false ) {
                angular.forEach(group.autoCompleteOptions, function(option){
                    group.value.push(option.key)
                });
            } else {
                group.value.length = 0;
            }
            search();
        }

        //called to determine order of side filters, looks at sort array passed in
        function getFilterOrder(filter) {
            return sfc.sort.indexOf(filter.filters.key);
        }
    }
}());
