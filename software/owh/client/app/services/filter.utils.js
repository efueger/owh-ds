(function () {
    'use strict';

    angular
        .module('owh.services').
        service('filterUtils', filterUtils);

    filterUtils.$inject = ['utilService', '$timeout'];

    /**
     * This utility service is used to prepare the OWH search filters.
     */
    function filterUtils(utilService, $timeout) {
        return {
            getBridgeDataFilters: getBridgeDataFilters
        };

        function getBridgeDataFilters() {

            //bridge data filter options
            var censusYearsOptions = [
                { "key": "2015", "title": "2015" },
                { "key": "2014", "title": "2014" },
                { "key": "2013", "title": "2013" },
                { "key": "2012", "title": "2012" },
                { "key": "2011", "title": "2011" },
                { "key": "2010", "title": "2010" },
                { "key": "2009", "title": "2009" },
                { "key": "2008", "title": "2008" },
                { "key": "2007", "title": "2007" },
                { "key": "2006", "title": "2006" },
                { "key": "2005", "title": "2005" },
                { "key": "2004", "title": "2004" },
                { "key": "2003", "title": "2003" },
                { "key": "2002", "title": "2002" },
                { "key": "2001", "title": "2001" },
                { "key": "2000", "title": "2000" }
            ];

            var censusGenderOptions =  [
                { "key": "Female", "title": "Female" },
                { "key": "Male", "title": "Male" }
            ];

            var censusRaceOptions =  [
                { "key": "White", "title": "White" },
                { "key": "Black", "title": "Black or African American" },
                { "key": "American Indian", "title": "American Indian" },
                { "key": "Asian or Pacific Islander", "title": "Asian or Pacific Islander" }
            ];

            var censusHispanicOriginOptions =  [
                { "key": "Non Hispanic", "title": "Non Hispanic" },
                { "key": "Hispanic or Latino", "title": "Hispanic or Latino" }
            ];

            var censusStateOptions =  [
                { "key": "01", "title": "Alabama" },
                { "key": "02", "title": "Alaska" },
                { "key": "04", "title": "Arizona" },
                { "key": "05", "title": "Arkansas" },
                { "key": "06", "title": "California" },
                { "key": "08", "title": "Colorado" },
                { "key": "09", "title": "Connecticut" },
                { "key": "10", "title": "Delaware" },
                { "key": "11", "title": "District of Columbia" },
                { "key": "12", "title": "Florida" },
                { "key": "13", "title": "Georgia" },
                { "key": "15", "title": "Hawaii" },
                { "key": "16", "title": "Idaho" },
                { "key": "17", "title": "Illinois" },
                { "key": "18", "title": "Indiana"},
                { "key": "19", "title": "Iowa" },
                { "key": "20", "title": "Kansas" },
                { "key": "21", "title": "Kentucky" },
                { "key": "22", "title": "Louisiana" },
                { "key": "23", "title": "Maine" },
                { "key": "24", "title": "Maryland" },
                { "key": "25", "title": "Massachusetts" },
                { "key": "26", "title": "Michigan" },
                { "key": "27", "title": "Minnesota" },
                { "key": "28", "title": "Mississippi" },
                { "key": "29", "title": "Missouri" },
                { "key": "30", "title": "Montana" },
                { "key": "31", "title": "Nebraska" },
                { "key": "32", "title": "Nevada" },
                { "key": "33", "title": "New Hampshire" },
                { "key": "34", "title": "New Jersey" },
                { "key": "35", "title": "New Mexico" },
                { "key": "36", "title": "New York" },
                { "key": "37", "title": "North Carolina" },
                { "key": "38", "title": "North Dakota" },
                { "key": "39", "title": "Ohio" },
                { "key": "40", "title": "Oklahoma" },
                { "key": "41", "title": "Oregon" },
                { "key": "42", "title": "Pennsylvania" },
                { "key": "44", "title": "Rhode Island" },
                { "key": "45", "title": "South Carolina" },
                { "key": "46", "title": "South Dakota" },
                { "key": "47", "title": "Tennessee" },
                { "key": "48", "title": "Texas" },
                { "key": "49", "title": "Utah" },
                { "key": "50", "title": "Vermont" },
                { "key": "51", "title": "Virginia" },
                { "key": "53", "title": "Washington" },
                { "key": "54", "title": "West Virginia" },
                { "key": "55", "title": "Wisconsin" },
                { "key": "56", "title": "Wyoming" }
            ];

            var censusAgeOptions = [
                {key:'0-4 years', title:'0 - 4 years', min: 1, max: 4},
                {key:'5-9 years', title:'5 - 9 years', min: 5, max: 9},
                {key:'10-14 years', title:'10 - 14 years', min: 10, max: 14},
                {key:'15-19 years', title:'15 - 19 years', min: 15, max: 19},
                {key:'20-24 years', title:'20 - 24 years', min: 20, max: 24},
                {key:'25-29 years', title:'25 - 29 years', min: 25, max: 29},
                {key:'30-34 years', title:'30 - 34 years', min: 30, max: 34},
                {key:'35-39 years', title:'35 - 39 years', min: 35, max: 39},
                {key:'40-44 years', title:'40 - 44 years', min: 40, max: 44},
                {key:'45-49 years', title:'45 - 49 years', min: 45, max: 49},
                {key:'50-54 years', title:'50 - 54 years', min: 50, max: 54},
                {key:'55-59 years', title:'55 - 59 years', min: 55, max: 59},
                {key:'60-64 years', title:'60 - 64 years', min: 60, max: 64},
                {key:'65-69 years', title:'65 - 69 years', min: 65, max: 69},
                {key:'70-74 years', title:'70 - 74 years', min: 70, max: 74},
                {key:'75-79 years', title:'75 - 79 years', min: 75, max: 79},
                {key:'80-84 years',title:'80 - 84 years', min: 80, max: 84},
                {key:'85-105 years',title:'85+ years', min: 85, max: 105},
                {key:'Age not stated',title:'Age not stated', min: -5, max: 0}
            ];

            var ageSliderOptions =  {
                from: -5,
                to: 85,
                step: 5,
                threshold: 0,
                scale: ['Not stated', 0, '', 10, '', 20, '', 30, '', 40, '', 50, '', 60, '', 70, '', 80, '>85'],
                modelLabels: {'-5': 'Not stated', 85: '>85'},
                css: {
                    background: {'background-color': '#ccc'}, before: {'background-color': '#ccc'},
                    default: {'background-color': 'white'}, after: {'background-color': '#ccc'},
                    pointer: {'background-color': '#914fb5'}, range: {"background-color": "#914fb5"}
                },
                callback: function(value, release) {
                    var self = this;
                    var values = value.split(';');
                    var minValue = Number(values[0]);
                    var maxValue = Number(values[1]);
                    var ageGroupFilter = utilService.findByKeyAndValue(bridgeDataFilters, 'key', 'agegroup');

                    var prevValue = angular.copy(ageGroupFilter.value);
                    ageGroupFilter.value = [];
                    // set the values list only if the slider selection is different from the default
                    if(! (minValue == -5  && maxValue == 85)) {
                        angular.forEach(ageGroupFilter.autoCompleteOptions, function(eachOption) {
                            if((eachOption.min <= minValue && eachOption.max >= minValue)
                                || (eachOption.min >= minValue && eachOption.max <= maxValue)
                                || (eachOption.min <= maxValue && eachOption.max >= maxValue)) {
                                ageGroupFilter.value.push(eachOption.key);
                            }
                        });
                    }

                    if(!ageGroupFilter.timer && !angular.equals(prevValue, ageGroupFilter.value)) {
                        ageGroupFilter.timer = $timeout(function() {
                            ageGroupFilter.timer=undefined;
                            self.search();
                        }, 2000);
                    }
                }
            };

            //prepare filter definitions
            var bridgeDataFilters = [
                {key: 'current_year', title: 'label.filter.yearly.estimate', queryKey:"current_year", primary: false, value: [], defaultGroup:'row', groupBy: false,
                    autoCompleteOptions: angular.copy(censusYearsOptions) },
                {key: 'sex', title: 'label.filter.gender', queryKey:"sex", primary: false, value: [], defaultGroup:'column', groupBy: 'column',
                    autoCompleteOptions: angular.copy(censusGenderOptions)},

                {key: 'agegroup', title: 'label.filter.agegroup', queryKey:"age_5_interval", primary: false, value:[],
                    groupBy: false, filterType: 'slider', autoCompleteOptions: angular.copy(censusAgeOptions),
                    sliderOptions: ageSliderOptions, sliderValue: '-5;105', timer: undefined, defaultGroup:"row"},

                {key: 'race', title: 'label.filter.race', queryKey:"race",primary: false, defaultGroup:'column', groupBy: 'row',
                    autoCompleteOptions: angular.copy(censusRaceOptions), value:[]},
                {key: 'ethnicity', title: 'label.filter.hispanicOrigin', queryKey:"hispanic_origin",primary: false, defaultGroup:'row', groupBy: false,
                    autoCompleteOptions: angular.copy(censusHispanicOriginOptions), value:[]},
                {key: 'state', title: 'label.filter.state', queryKey:"state",primary: false, value:[], defaultGroup:'row', groupBy: false,
                    autoCompleteOptions: angular.copy(censusStateOptions)}
            ];

            return bridgeDataFilters;
        }
    }

}());