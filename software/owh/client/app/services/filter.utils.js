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
            getBridgeDataFilters: getBridgeDataFilters,
            getNatalityDataFilters: getNatalityDataFilters
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
                { "key": "American Indian", "title": "American Indian" },
                { "key": "Asian or Pacific Islander", "title": "Asian or Pacific Islander" },
                { "key": "Black", "title": "Black or African American" },
                { "key": "White", "title": "White" }
            ];

            var censusHispanicOriginOptions =  [
                { "key": "Non-Hispanic", "title": "Non Hispanic" },
                { "key": "Hispanic", "title": "Hispanic or Latino" }
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
                {key: 'current_year', title: 'label.filter.yearly.estimate', queryKey:"current_year", primary: false, value: ['2015'], defaultGroup:'row', groupBy: false,
                    filterType: 'checkbox',autoCompleteOptions: angular.copy(censusYearsOptions) },
                {key: 'sex', title: 'label.filter.gender', queryKey:"sex", primary: false, value: [], defaultGroup:'column', groupBy: 'column',
                    filterType: 'checkbox',autoCompleteOptions: angular.copy(censusGenderOptions)},

                {key: 'agegroup', title: 'label.filter.agegroup', queryKey:"age_5_interval", primary: false, value:[], groupBy: false,
                    filterType: 'slider', autoCompleteOptions: angular.copy(censusAgeOptions),
                    sliderOptions: ageSliderOptions, sliderValue: '-5;105', timer: undefined, defaultGroup:"row"},

                {key: 'race', title: 'label.filter.race', queryKey:"race",primary: false, defaultGroup:'column', groupBy: 'row',
                    filterType: 'checkbox',autoCompleteOptions: angular.copy(censusRaceOptions), value:[]},
                {key: 'ethnicity', title: 'label.filter.hispanicOrigin', queryKey:"ethnicity_group",primary: false, defaultGroup:'row', groupBy: false,
                    filterType: 'checkbox',autoCompleteOptions: angular.copy(censusHispanicOriginOptions), value:[]},
                {key: 'state', title: 'label.filter.state', queryKey:"state",primary: false, value:[], defaultGroup:'row', groupBy: false,
                    filterType: 'checkbox',autoCompleteOptions: angular.copy(censusStateOptions), displaySearchBox:true, displaySelectedFirst:true}
            ];

            return bridgeDataFilters;
        }

        function getNatalityDataFilters() {
            //filter options
            var yearOptions = [
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

            var monthOptions = [
                { "key": "January", "title": "January" },
                { "key": "February", "title": "February" },
                { "key": "March", "title": "March" },
                { "key": "April", "title": "April" },
                { "key": "May", "title": "May" },
                { "key": "June", "title": "June" },
                { "key": "July", "title": "July" },
                { "key": "August", "title": "August" },
                { "key": "September", "title": "September" },
                { "key": "October", "title": "October" },
                { "key": "November", "title": "November" },
                { "key": "December", "title": "December" }
            ];

            var weekDayOptions = [
                { "key": "Sunday", "title": "Sunday" },
                { "key": "Monday", "title": "Monday" },
                { "key": "Tuesday", "title": "Tuesday" },
                { "key": "Wednesday", "title": "Wednesday" },
                { "key": "Thursday", "title": "Thursday" },
                { "key": "Friday", "title": "Friday" },
                { "key": "Saturday", "title": "Saturday" }
            ];

            var prenatalCareMonthOptions = [
                { "key": "No prenatal care", "title": "No prenatal care" },
                { "key": "1st month", "title": "1st month" },
                { "key": "2nd month", "title": "2nd month" },
                { "key": "3rd month", "title": "3rd month" },
                { "key": "4th month", "title": "4th month" },
                { "key": "5th month", "title": "5th month" },
                { "key": "6th month", "title": "6th month" },
                { "key": "7th month", "title": "7th month" },
                { "key": "8th month", "title": "8th month" },
                { "key": "9th month", "title": "9th month" },
                { "key": "10th month", "title": "10th month" },
                { "key": "Unknown or not stated", "title": "Unknown or not stated" },
                { "key": "Not on certificate", "title": "Not on certificate" }
            ];

            var genderOptions =  [
                { "key": "Female", "title": "Female" },
                { "key": "Male", "title": "Male" }
            ];

            var raceOptions =  [
                { "key": "American Indian or Alaska Native", "title": "American Indian" },
                { "key": "Asian or Pacific Islander", "title": "Asian or Pacific Islander" },
                { "key": "Black", "title": "Black or African American" },
                { "key": "White", "title": "White" }
            ];

            var hispanicOptions =  [
                { "key": "Mexican", "title": "Mexican" },
                { "key": "Puerto Rican", "title": "Puerto Rican" },
                { "key": "Cuban", "title": "Cuban" },
                { "key": "Central and South American", "title": "Central and South American" },
                { "key": "Other and Unknown Hispanic Origin", "title": "Other and Unknown Hispanic Origin" },
                { "key": "Non-Hispanic White", "title": "Non-Hispanic White" },
                { "key": "Non-Hispanic Black", "title": "Non-Hispanic Black" },
                { "key": "Non-Hispanic other races", "title": "Non-Hispanic other races" },
                { "key": "Origin unknown or not stated", "title": "Origin unknown or not stated" }
            ];

            var singleYearAgeOptions =  [
                { "key": "13 years", "title": "13 years" },
                { "key": "14 years", "title": "14 years" },
                { "key": "15 years", "title": "15 years" },
                { "key": "16 years", "title": "16 years" },
                { "key": "17 years", "title": "17 years" },
                { "key": "18 years", "title": "18 years" },
                { "key": "19 years", "title": "19 years" },
                { "key": "20 years", "title": "20 years" },
                { "key": "21 years", "title": "21 years" },
                { "key": "22 years", "title": "22 years" },
                { "key": "23 years", "title": "23 years" },
                { "key": "24 years", "title": "24 years" },
                { "key": "25 years", "title": "25 years" },
                { "key": "26 years", "title": "26 years" },
                { "key": "27 years", "title": "27 years" },
                { "key": "28 years", "title": "28 years" },
                { "key": "29 years", "title": "29 years" },
                { "key": "30 years", "title": "30 years" },
                { "key": "31 years", "title": "31 years" },
                { "key": "32 years", "title": "32 years" },
                { "key": "33 years", "title": "33 years" },
                { "key": "34 years", "title": "34 years" },
                { "key": "35 years", "title": "35 years" },
                { "key": "36 years", "title": "36 years" },
                { "key": "37 years", "title": "37 years" },
                { "key": "38 years", "title": "38 years" },
                { "key": "39 years", "title": "39 years" },
                { "key": "40 years", "title": "40 years" },
                { "key": "41 years", "title": "41 years" },
                { "key": "42 years", "title": "42 years" },
                { "key": "43 years", "title": "43 years" },
                { "key": "44 years", "title": "44 years" },
                { "key": "45 years", "title": "45 years" },
                { "key": "46 years", "title": "46 years" },
                { "key": "47 years", "title": "47 years" },
                { "key": "48 years", "title": "48 years" },
                { "key": "49 years", "title": "49 years" },
                { "key": "50-54 years", "title": "50-54 years"}
            ];

            var ageR8Options =  [
                { "key": "Under 15 years", "title": "Under 15 years" },
                { "key": "15-19 years", "title": "15-19 years" },
                { "key": "20-24 years", "title": "20-24 years" },
                { "key": "25-29 years", "title": "25-29 years" },
                { "key": "30-34 years", "title": "30-34 years" },
                { "key": "35-39 years", "title": "35-39 years" },
                { "key": "40-44 year", "title": "40-44 year" },
                { "key": "45-49 years", "title": "45-49 years" },
                { "key": "50-54 years", "title": "50-54 years" }
            ];
            var ageR9Options =  [
                { "key": "Under 15 years", "title": "Under 15 years" },
                { "key": "15-19 years", "title": "15-19 years" },
                { "key": "20-24 years", "title": "20-24 years" },
                { "key": "25-29 years", "title": "25-29 years" },
                { "key": "30-34 years", "title": "30-34 years" },
                { "key": "35-39 years", "title": "35-39 years" },
                { "key": "40-44 year", "title": "40-44 year" },
                { "key": "45-49 years", "title": "45-49 years" },
                { "key": "50-54 years", "title": "50-54 years" }
            ];

            var ageR14ptions =  [
                { "key": "Under 15 years", "title": "Under 15 years" },
                { "key": "15 years", "title": "15 years" },
                { "key": "16 years", "title": "16 years" },
                { "key": "17 years", "title": "17 years" },
                { "key": "18 years", "title": "18 years" },
                { "key": "19 years", "title": "19 years" },
                { "key": "20-24 years", "title": "20-24 years" },
                { "key": "25-29 years", "title": "25-29 years" },
                { "key": "30-34 years", "title": "30-34 years" },
                { "key": "35-39 years", "title": "35-39 years" },
                { "key": "40-44 years", "title": "40-44 years" },
                { "key": "45-49 years", "title": "45-49 years" },
                { "key": "50-54 years", "title": "50-54 years" }
            ];

            var gestationalAgeAtBirth =  [
                { "key": "Under 20 weeks", "title": "Under 20 weeks" },
                { "key": "20 - 27 weeks", "title": "20 - 27 weeks" },
                { "key": "28 - 31 weeks", "title": "28 - 31 weeks" },
                { "key": "32 - 35 weeks", "title": "32 - 35 weeks" },
                { "key": "36 weeks", "title": "30-34 years" },
                { "key": "37 - 39 weeks", "title": "37 - 39 weeks" },
                { "key": "40 weeks", "title": "40 weeks" },
                { "key": "41 weeks", "title": "41 weeks" },
                { "key": "Not stated", "title": "Not stated" }
            ];

            var maritalStatusOptions = [
                {key:'Married', title:'Married'},
                {key:'Unmarried', title:'Unmarried'},
                {key:'Unknown or not Stated', title:'Unknown or not Stated'}
            ];

            var educationOptions = [
                {key:'0 – 8 years', title:'0 – 8 years'},
                {key:'9 – 11 years', title:'9 – 11 years'},
                {key:'12 years', title:'12 years'},
                {key:'13 – 15 years', title:'13 – 15 years'},
                {key:'16 years and over', title:'16 years and over'},
                {key:'Not stated', title:'Not stated'},
                {key:'8th grade or less', title:'8th grade or less'},
                {key:'9th through 12th grade with no diploma', title:'9th through 12th grade with no diploma'},
                {key:'High school graduate or GED completed', title:'High school graduate or GED completed'},
                {key:'Some college credit, but not a degree', title:'Some college credit, but not a degree'},
                {key:'Associate degree (AA,AS)', title:'Associate degree (AA,AS)'},
                {key:'Bachelor’s degree (BA, AB, BS)', title:'Bachelor’s degree (BA, AB, BS)'},
                {key:'Master’s degree (MA, MS, MEng, MEd, MSW, MBA)', title:'Master’s degree (MA, MS, MEng, MEd, MSW, MBA)'},
                {key:'Doctorate (PhD, EdD) or Professional Degree (MD, DDS, DVM, LLB, JD)', title:'Doctorate (PhD, EdD) or Professional Degree (MD, DDS, DVM, LLB, JD)'},
                {key:'Unknown', title:'Unknown'},
                {key:'Not on certificate', title:'Not on certificate'}
            ];

            var birthWeightOptions = [
                {key:'100 - 199 grams', title:'100 - 199 grams'},
                {key:'200 - 299 grams', title:'200 - 299 grams'},
                {key:'300 - 399 grams', title:'300 - 399 grams'},
                {key:'400 - 499 grams', title:'400 - 499 grams'},
                {key:'500 - 599 grams', title:'500 - 599 grams'},
                {key:'600 - 699 grams', title:'600 - 699 grams'},
                {key:'700 - 799 grams', title:'700 - 799 grams'},
                {key:'800 - 899 grams', title:'800 - 899 grams'},
                {key:'900 - 999 grams', title:'900 - 999 grams'},
                {key:'1000 - 1099 grams', title:'1000 - 1099 grams'},
                {key:'1100 - 1199 grams', title:'1100 - 1199 grams'},
                {key:'1200 - 1299 grams', title:'1200 - 1299 grams'},
                {key:'1300 - 1399 grams', title:'1300 - 1399 grams'},
                {key:'1400 - 1499 grams', title:'1400 - 1499 grams'},
                {key:'1500 - 1599 grams', title:'1500 - 1599 grams'},
                {key:'1600 - 1699 grams', title:'1600 - 1699 grams'},
                {key:'1700 - 1799 grams', title:'1700 - 1799 grams'},
                {key:'1800 - 1899 grams', title:'1800 - 1899 grams'},
                {key:'1900 - 1999 grams', title:'1900 - 1999 grams'},
                {key:'2000 - 2099 grams', title:'2000 - 2099 grams'},
                {key:'2100 - 2199 grams', title:'2100 - 2199 grams'},
                {key:'2200 - 2299 grams', title:'2200 - 2299 grams'},
                {key:'2300 - 2399 grams', title:'2300 - 2399 grams'},
                {key:'2400 - 2499 grams', title:'2400 - 2499 grams'},
                {key:'2500 - 2599 grams', title:'2500 - 2599 grams'},
                {key:'2600 - 2699 grams', title:'2600 - 2699 grams'},
                {key:'2700 - 2799 grams', title:'2700 - 2799 grams'},
                {key:'2800 - 2899 grams', title:'2800 - 2899 grams'},
                {key:'2900 - 2999 grams', title:'2900 - 2999 grams'},
                {key:'3000 - 3099 grams', title:'3000 - 3099 grams'},
                {key:'3100 - 3199 grams', title:'3100 - 3199 grams'},
                {key:'3200 - 3299 grams', title:'3200 - 3299 grams'},
                {key:'3300 - 3399 grams', title:'3300 - 3399 grams'},
                {key:'3400 - 3499 grams', title:'3400 - 3499 grams'},
                {key:'3500 - 3599 grams', title:'3500 - 3599 grams'},
                {key:'3600 - 3699 grams', title:'3600 - 3699 grams'},
                {key:'3700 - 3799 grams', title:'3700 - 3799 grams'},
                {key:'3800 - 3899 grams', title:'3800 - 3899 grams'},
                {key:'3900 - 3999 grams', title:'3900 - 3999 grams'},
                {key:'4000 - 4099 grams', title:'4000 - 4099 grams'},
                {key:'4100 - 4199 grams', title:'4100 - 4199 grams'},
                {key:'4200 - 4299 grams', title:'4200 - 4299 grams'},
                {key:'4300 - 4399 grams', title:'4300 - 4399 grams'},
                {key:'4400 - 4499 grams', title:'4400 - 4499 grams'},
                {key:'4500 - 4599 grams', title:'4500 - 4599 grams'},
                {key:'4600 - 4699 grams', title:'4600 - 4699 grams'},
                {key:'4700 - 4799 grams', title:'4700 - 4799 grams'},
                {key:'4800 - 4899 grams', title:'4800 - 4899 grams'},
                {key:'4900 - 4999 grams', title:'4900 - 4999 grams'},
                {key:'5000 - 5099 grams', title:'5000 - 5099 grams'},
                {key:'5100 - 5199 grams', title:'5100 - 5199 grams'},
                {key:'5200 - 5299 grams', title:'5200 - 5299 grams'},
                {key:'5300 - 5399 grams', title:'5300 - 5399 grams'},
                {key:'5400 - 5499 grams', title:'5400 - 5499 grams'},
                {key:'5500 - 5599 grams', title:'5500 - 5599 grams'},
                {key:'5600 - 5699 grams', title:'5600 - 5699 grams'},
                {key:'5700 - 5799 grams', title:'5700 - 5799 grams'},
                {key:'5800 - 5899 grams', title:'5800 - 5899 grams'},
                {key:'5900 - 5999 grams', title:'5900 - 5999 grams'},
                {key:'6000 - 6099 grams', title:'6000 - 6099 grams'},
                {key:'6100 - 6199 grams', title:'6100 - 6199 grams'},
                {key:'6200 - 6299 grams', title:'6200 - 6299 grams'},
                {key:'6300 - 6399 grams', title:'6300 - 6399 grams'},
                {key:'6400 - 6499 grams', title:'6400 - 6499 grams'},
                {key:'6500 - 6599 grams', title:'6500 - 6599 grams'},
                {key:'6600 - 6699 grams', title:'6600 - 6699 grams'},
                {key:'6700 - 6799 grams', title:'6700 - 6799 grams'},
                {key:'6800 - 6899 grams', title:'6800 - 6899 grams'},
                {key:'6900 - 6999 grams', title:'6900 - 6999 grams'},
                {key:'7000 - 7099 grams', title:'7000 - 7099 grams'},
                {key:'7100 - 7199 grams', title:'7100 - 7199 grams'},
                {key:'7200 - 7299 grams', title:'7200 - 7299 grams'},
                {key:'7300 - 7399 grams', title:'7300 - 7399 grams'},
                {key:'7400 - 7499 grams', title:'7400 - 7499 grams'},
                {key:'7500 - 7599 grams', title:'7500 - 7599 grams'},
                {key:'7600 - 7699 grams', title:'7600 - 7699 grams'},
                {key:'7700 - 7799 grams', title:'7700 - 7799 grams'},
                {key:'7800 - 7899 grams', title:'7800 - 7899 grams'},
                {key:'7900 - 7999 grams', title:'7900 - 7999 grams'},
                {key:'8000 - 8099 grams', title:'8000 - 8099 grams'},
                {key:'8100 - 8165 grams', title:'8100 - 8165 grams'},
                {key:'Not Stated', title:'Not Stated'}
            ];

            var birthWeightR12Options = [
                {key:'499 grams or less', title:'499 grams or less'},
                {key:'500 - 999 grams', title:'500 - 999 grams'},
                {key:'1000 - 1499 grams', title:'1000 - 1499 grams'},
                {key:'1500 - 1999 grams', title:'1500 - 1999 grams'},
                {key:'2000 - 2499 grams', title:'2000 - 2499 grams'},
                {key:'2500 - 2999 grams', title:'2500 - 2999 grams'},
                {key:'3000 - 3499 grams', title:'3000 - 3499 grams'},
                {key:'3500 - 3999 grams', title:'3500 - 3999 grams'},
                {key:'4000 - 4499 grams', title:'4000 - 4499 grams'},
                {key:'4500 - 4999 grams', title:'4500 - 4999 grams'},
                {key:'5000 - 8165 grams', title:'5000 - 8165 grams'},
                {key:'Not Stated', title:'Not Stated'}
            ];

            var birthWeightR4Options = [
                {key:'1499 grams or less', title:'1499 grams or less'},
                {key:'1500 – 2499 grams', title:'1500 – 2499 grams'},
                {key:'2500 grams or more', title:'2500 grams or more'},
                {key:'Unknown or not stated', title:'Unknown or not stated'}
            ];
            var birthPluralityOptions = [
                {key:'Single', title:'Single'},
                {key:'Twin', title:'Twin'},
                {key:'Triplet', title:'Triplet'},
                {key:'Quadruplet', title:'Quadruplet'},
                {key:'Quintuplet or higher', title:'Quintuplet or higher'}
            ];

            var liveBirthOrderOptions = [
                {key:'1st child born alive to mother', title:'1st child born alive to mother'},
                {key:'2nd child born alive to mother', title:'2nd child born alive to mother'},
                {key:'3rd child born alive to mother', title:'3rd child born alive to mother'},
                {key:'4th child born alive to mother', title:'4th child born alive to mother'},
                {key:'5th child born alive to mother', title:'5th child born alive to mother'},
                {key:'6th child born alive to mother', title:'6th child born alive to mother'},
                {key:'7th child born alive to mother', title:'7th child born alive to mother'},
                {key:'8 or more live births', title:'8 or more live births'},
                {key:'Unknown or not stated', title:'Unknown or not stated'}
            ];

            var birthPlaceOptions = [
                {key:'In Hospital', title:'In Hospital'},
                {key:'Freestanding Birthing Center', title:'Freestanding Birthing Center'},
                {key:'Clinic / Doctor’s Office', title:'Clinic / Doctor’s Office'},
                {key:'Residence', title:'Residence'},
                {key:'Other', title:'Other'},
                {key:'Unknown', title:'Unknown'}
            ];

            var deliveryMethodOptions = [
                {key:'Cesarean', title:'Cesarean'},
                {key:'Vaginal', title:'Vaginal'},
                {key:'Not stated', title:'Not stated'},
                {key:'Unknown', title:'Unknown'}
            ];

            var medicalAttendantOptions = [
                {key:'Doctor of Medicine (MD)', title:'Doctor of Medicine (MD)'},
                {key:'Doctor of Osteopathy (DO)', title:'Doctor of Osteopathy (DO)'},
                {key:'Certified Nurse Midwife (CNM)', title:'Certified Nurse Midwife (CNM)'},
                {key:'Other Midwife', title:'Other Midwife'},
                {key:'Other', title:'Other'},
                {key:'Unknown or not stated', title:'Unknown or not stated'}
            ];
            var anemiaOptions = [
                {key:'Yes', title:'Yes'},
                {key:'No', title:'No'},
                {key:'Unknown', title:'Unknown'},
                {key:'Not on certificate', title:'Not on certificate'}
            ];

            var cardiacDiseaseOptions = [
                {key:'Yes', title:'Yes'},
                {key:'No', title:'No'},
                {key:'Unknown', title:'Unknown'},
                {key:'Not on certificate', title:'Not on certificate'}
            ];

            var chronicHypertensionOptions = [
                {key:'Yes', title:'Yes'},
                {key:'No', title:'No'},
                {key:'Unknown', title:'Unknown'},
                {key:'Not on certificate', title:'Not on certificate'}
            ];
            var pregnancyHypertensionOptions = [
                {key:'Yes', title:'Yes'},
                {key:'No', title:'No'},
                {key:'Unknown', title:'Unknown'},
                {key:'Not on certificate', title:'Not on certificate'}
            ];

            var diabetesOptions = [
                {key:'Yes', title:'Yes'},
                {key:'No', title:'No'},
                {key:'Unknown', title:'Unknown'},
                {key:'Not on certificate', title:'Not on certificate'}
            ];

            var eclampsiaOptions = [
                {key:'Yes', title:'Yes'},
                {key:'No', title:'No'},
                {key:'Unknown', title:'Unknown'},
                {key:'Not on certificate', title:'Not on certificate'}
            ];

            var hydraOligoOptions = [
                {key:'Yes', title:'Yes'},
                {key:'No', title:'No'},
                {key:'Unknown', title:'Unknown'},
                {key:'Not on certificate', title:'Not on certificate'}
            ];

            var incompetentCervixOptions = [
                {key:'Yes', title:'Yes'},
                {key:'No', title:'No'},
                {key:'Unknown', title:'Unknown'},
                {key:'Not on certificate', title:'Not on certificate'}
            ];

            var lungDiseaseOptions = [
                {key:'Yes', title:'Yes'},
                {key:'No', title:'No'},
                {key:'Unknown', title:'Unknown'},
                {key:'Not on certificate', title:'Not on certificate'}
            ];

            var tobaccoOptions = [
                {key:'Yes', title:'Yes'},
                {key:'No', title:'No'},
                {key:'Unknown', title:'Unknown'},
                {key:'Not on certificate', title:'Not on certificate'}
            ];

            //prepare filter definitions
            var natalityFilters = [
                {key: 'hispanic_origin', title: 'label.filter.hispanicOrigin', queryKey:"hispanic_origin",
                    primary: false, value: [], defaultGroup:'row', groupBy: false,
                    filterType: "checkbox", autoCompleteOptions: angular.copy(hispanicOptions) },

                {key: 'mother_age', title: 'label.chart.mother_age.single.yr', queryKey:"mother_age", primary: false, value: [],
                    defaultGroup:'column', groupBy: false, filterType: "checkbox", autoCompleteOptions: angular.copy(singleYearAgeOptions)},

                {key: 'mother_age_r9', title: 'label.chart.mother_age.r9', queryKey:"mother_age_r9", primary: false, value: [],
                    defaultGroup:'column', groupBy: false, filterType: "checkbox", autoCompleteOptions: angular.copy(ageR9Options)},

                {key: 'mother_age_r8', title: 'label.filter.ageOfMother', queryKey:"mother_age_r8", primary: false, value: [],
                    defaultGroup:'column', groupBy: false, filterType: "checkbox", autoCompleteOptions: angular.copy(ageR8Options)},

                {key: 'mother_age_r14', title: 'label.chart.mother_age.r12', queryKey:"mother_age_r14", primary: false, value: [],
                    defaultGroup:'column', groupBy: false, filterType: "checkbox", autoCompleteOptions: angular.copy(ageR14ptions)},

                {key: 'mother_race', title: 'label.filter.race', queryKey:"mother_race", primary: false, value: [],
                    defaultGroup:'column', groupBy: 'row', filterType: "checkbox", autoCompleteOptions: angular.copy(raceOptions)},

                {key: 'marital_status', title: 'label.filter.maritalStatus', queryKey:"marital_status", primary: false,
                    value: [], defaultGroup:'column', groupBy:false, filterType: "checkbox", autoCompleteOptions: angular.copy(maritalStatusOptions)},

                {key: 'mother_education', title: 'label.filter.education', queryKey:"mother_education", primary: false,
                    value: [], defaultGroup:'column', groupBy: false, filterType: "checkbox", autoCompleteOptions: angular.copy(educationOptions)},

                {key: 'dob_yy', title: 'label.filter.year', queryKey:"dob_yy", primary: false, value: ["2014"], defaultGroup:'column', groupBy: false,
                    filterType: "checkbox", autoCompleteOptions: angular.copy(yearOptions)},

                {key: 'dob_mm', title: 'label.filter.month', queryKey:"dob_mm", primary: false, value: [], defaultGroup:'column', groupBy: false,
                    filterType: "checkbox", autoCompleteOptions: angular.copy(monthOptions)},

                {key: 'dob_wk', title: 'label.filter.weekday', queryKey:"dob_wk", primary: false, value: [], defaultGroup:'column', groupBy: false,
                    filterType: "checkbox", autoCompleteOptions: angular.copy(weekDayOptions)},

                {key: 'sex', title: 'label.filter.gender', queryKey:"sex", primary: false, value: [], defaultGroup:'column', groupBy: 'column',
                    filterType: "checkbox", autoCompleteOptions: angular.copy(genderOptions)},

                {key: 'gestational_age_r10', title: 'label.filter.gestational.birth.age', queryKey:"gestational_age_r10",
                    primary: false, value: [], defaultGroup:'column', groupBy: false,
                    filterType: "checkbox", autoCompleteOptions: angular.copy(gestationalAgeAtBirth)},

                {key: 'prenatal_care', title: 'label.filter.monthPrenatalCareBegan', queryKey:"prenatal_care",
                    primary: false, value: [], defaultGroup:'column', groupBy: false,
                    filterType: "checkbox", autoCompleteOptions: angular.copy(prenatalCareMonthOptions)},

                {key: 'birth_weight', title: 'label.filter.birthWeight', queryKey:"birth_weight", primary: false,
                    value: [], defaultGroup:'column', groupBy: false, filterType: "checkbox", autoCompleteOptions: angular.copy(birthWeightOptions)},
                {key: 'birth_weight_r4', title: 'label.filter.birth_weight.r4', queryKey:"birth_weight_r4", primary: false,
                    value: [], defaultGroup:'column', groupBy: false, filterType: "checkbox", autoCompleteOptions: angular.copy(birthWeightR4Options)},
                {key: 'birth_weight_r12', title: 'label.chart.birth_weight.r12', queryKey:"birth_weight_r12", primary: false,
                    value: [], defaultGroup:'column', groupBy: false, filterType: "checkbox", autoCompleteOptions: angular.copy(birthWeightR12Options)},

                {key: 'birth_plurality', title: 'label.filter.plurality', queryKey:"birth_plurality", primary: false,
                    value: [], defaultGroup:'column', groupBy: false, filterType: "checkbox", autoCompleteOptions: angular.copy(birthPluralityOptions)},

                {key: 'live_birth', title: 'label.filter.liveBirthOrder', queryKey:"live_birth", primary: false,
                    value: [], defaultGroup:'column', groupBy: false, filterType: "checkbox", autoCompleteOptions: angular.copy(liveBirthOrderOptions)},

                {key: 'birth_place', title: 'label.filter.birthPlace', queryKey:"birth_place", primary: false,
                    value: [], defaultGroup:'column', groupBy: false, filterType: "checkbox", autoCompleteOptions: angular.copy(birthPlaceOptions)},

                {key: 'delivery_method', title: 'label.filter.deliveryMethod', queryKey:"delivery_method", primary: false,
                    value: [], defaultGroup:'column', groupBy: false, filterType: "checkbox", autoCompleteOptions: angular.copy(deliveryMethodOptions)},

                {key: 'medical_attendant', title: 'label.filter.medicalAttendant', queryKey:"medical_attendant", primary: false,
                    value: [], defaultGroup:'column', groupBy: false, filterType: "checkbox", autoCompleteOptions: angular.copy(medicalAttendantOptions)},

                {key: 'anemia', title: 'label.filter.anemia', queryKey:"anemia", primary: false,
                    value: [], defaultGroup:'column', groupBy: false, filterType: "checkbox", autoCompleteOptions: angular.copy(anemiaOptions)},
                {key: 'cardiac_disease', title: 'label.filter.cardiac.disease', queryKey:"cardiac_disease", primary: false,
                    value: [], defaultGroup:'column', groupBy: false, filterType: "checkbox", autoCompleteOptions: angular.copy(cardiacDiseaseOptions)},
                {key: 'chronic_hypertension', title: 'label.filter.chronicHypertension', queryKey:"chronic_hypertension", primary: false,
                    value: [], defaultGroup:'column', groupBy: false, filterType: "checkbox", autoCompleteOptions: angular.copy(chronicHypertensionOptions)},

                {key: 'diabetes', title: 'label.filter.diabetes', queryKey:"diabetes", primary: false,
                    value: [], defaultGroup:'column', groupBy: false, filterType: "checkbox", autoCompleteOptions: angular.copy(diabetesOptions)},

                {key: 'pregnancy_hypertension', title: 'label.filter.pregnancy.hypertension', queryKey:"pregnancy_hypertension", primary: false,
                    value: [], defaultGroup:'column', groupBy: false, filterType: "checkbox", autoCompleteOptions: angular.copy(pregnancyHypertensionOptions)},

                {key: 'eclampsia', title: 'label.filter.eclampsia', queryKey:"eclampsia", primary: false, value: [],
                    defaultGroup:'column', groupBy: false, filterType: "checkbox",autoCompleteOptions: angular.copy(eclampsiaOptions)},

                {key: 'hydramnios_oligohydramnios', title: 'label.filter.hydramnios.oligohydramnios', queryKey:"hydramnios_oligohydramnios", primary: false, value: [],
                    defaultGroup:'column', groupBy: false, filterType: "checkbox",autoCompleteOptions: angular.copy(hydraOligoOptions)},

                {key: 'incompetent_cervix', title: 'label.filter.incompetent.cervix', queryKey:"incompetent_cervix", primary: false, value: [],
                    defaultGroup:'column', groupBy: false, filterType: "checkbox",autoCompleteOptions: angular.copy(incompetentCervixOptions)},
                {key: 'lung_disease', title: 'label.filter.lung.disease', queryKey:"lung_disease", primary: false, value: [],
                    defaultGroup:'column', groupBy: false, filterType: "checkbox",autoCompleteOptions: angular.copy(lungDiseaseOptions)},

                {key: 'tobacco_use', title: 'label.filter.tobacco.use', queryKey:"tobacco_use", primary: false,
                    value: [], defaultGroup:'column', groupBy: false, filterType: "checkbox", autoCompleteOptions: angular.copy(tobaccoOptions)}
            ];

            return natalityFilters;
        }
    }

}());