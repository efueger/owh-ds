'use strict';
(function(){
    angular
        .module('owh')
        .component("owhSideFilter",{
            templateUrl: 'app/components/owh-side-filter/owhSideFilter.html',
            controller: sideFilterController,
            controllerAs: 'sfc',
            bindings:{
                //TODO: change to one-way binding and bubble filter changes up with event bindings
                filters : "=",
                onFilter: '&',
                sort: '<',
                showFilters: '<'
            }
        });

    sideFilterController.$inject=['ModalService', 'utilService', 'searchFactory'];

    function sideFilterController(ModalService, utilService, searchFactory){
        var sfc = this;
        sfc.getOptionCountPercentage = getOptionCountPercentage;
        sfc.getOptionCount = getOptionCount;
        sfc.showModal = showModal;
        sfc.clearSelection = clearSelection;
        sfc.updateGroupValue = updateGroupValue;
        sfc.getFilterOrder = getFilterOrder;
        sfc.isVisible = isVisible;
        sfc.isSubOptionSelected = isSubOptionSelected;
        sfc.filterGroup = filterGroup;
        sfc.isOptionDisabled = isOptionDisabled;

        function isOptionDisabled(group, option) {
            if(group.key === 'hispanicOrigin') {
                //check if unknown is selected
                if(group.value.indexOf('Unknown') >= 0) {
                    //if unknown is selected then disable all other hispanic options
                    if(option.key !== 'Unknown') {
                        return true;
                    }
                } else {
                    //else, if other option is selected disable unknown
                    if(group.value.length > 0 && option.key === 'Unknown') {
                        return true;
                    }
                }
            }
            return false;
        }

        function filterGroup(option, group) {
            //check if group option is added
            if(group.value.indexOf(option.key) >= 0) {
                //clear group options, and then add subOptions to value
                clearGroupOptions(option, group);
                angular.forEach(option.options, function(subOption) {
                    group.value.push(subOption.key);
                });
            } else {
                //else, clear group options
                clearGroupOptions(option, group);
            }
            sfc.onFilter();
        }

        function clearGroupOptions(option, group) {
            angular.forEach(option.options, function(subOption) {
                if(group.value.indexOf(subOption.key) >= 0) {
                    group.value.splice(group.value.indexOf(subOption.key), 1);
                }
            });
        }

        function isSubOptionSelected(group, option) {
            for(var i = 0; i < group.value.length; i++) {
                for(var j = 0; j < option.options.length; j++) {
                    if(group.value[i] === option.options[j].key) {
                        return true;
                    }
                }
            }
            return false;
        }

        function getOptionCountPercentage(option) {
            var countKey = sfc.filters.selectedPrimaryFilter.key;
            var countPercentKey = countKey + 'Percentage';
            return option && option[countPercentKey] ? option[countPercentKey] : 0
        }

        function getOptionCount(option) {
            var countKey = sfc.filters.selectedPrimaryFilter.key;
            //check if group option
            if(option.options) {
                var count = 0;
                angular.forEach(option.options, function(subOption) {
                    count+= (subOption[countKey] ? subOption[countKey] : 0);
                });
                return count;
            } else {
                return option && option[countKey] ? option[countKey] : 0
            }

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
                        sfc.onFilter();
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
            sfc.onFilter();
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
            sfc.onFilter();
        }

        //called to determine order of side filters, looks at sort array passed in
        function getFilterOrder(filter) {
            return sfc.sort.indexOf(filter.filters.key);
        }

        function isVisible(filter) {
            if(!sfc.showFilters) {
                return true;
            }
            return sfc.showFilters.indexOf(filter.filters.key) >= 0;
        }
    }
}());
