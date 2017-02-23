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
                    filterType: 'checkbox',autoCompleteOptions: angular.copy(censusYearsOptions), refreshFiltersOnChange: true },
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
            //bridge data filter options
            var yearOptions = [
                { "key": "2014", "title": "2014" },
                { "key": "2013", "title": "2013" },
                { "key": "2012", "title": "2012" },
                { "key": "2011", "title": "2011" },
                { "key": "2010", "title": "2010" },
                { "key": "2009", "title": "2009" },
                { "key": "2008", "title": "2008" },
                { "key": "2007", "title": "2007" }
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
                { "key": "Non-Hispanic", "title": "Non Hispanic" },
                { "key": "Mexican", "title": "Mexican" },
                { "key": "Puerto Rican", "title": "Puerto Rican" },
                { "key": "Cuban", "title": "Cuban" },
                { "key": "Central and South American", "title": "Central and South American" },
                { "key": "Other and Unknown Hispanic Origin", "title": "Other and Unknown Hispanic Origin" },
                { "key": "Hispanic origin not stated", "title": "Hispanic origin not stated" }
            ];

            var ageOptions =  [
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

            var maritalStatusOptions = [
                {key:'Married', title:'Married'},
                {key:'Unmarried', title:'Unmarried'},
                {key:'Unknown or not Stated', title:'Unknown or not Stated'}
            ];

            var educationOptions = [
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
                {key:'Not in Hospital', title:'Not in Hospital'},
                {key:'Unknown or Not Stated', title:'Unknown or Not Stated'}
            ];

            var deliveryMethodOptions = [
                {key:'Cesarean', title:'Cesarean'},
                {key:'Vaginal', title:'Vaginal'},
                {key:'Unknown', title:'Unknown'}
            ];

            var medicalAttendantOptions = [
                {key:'Doctor of Medicine (MD)', title:'Doctor of Medicine (MD)'},
                {key:'Doctor of Osteopathy (DO)', title:'Doctor of Osteopathy (DO)'},
                {key:'Certified Nurse Midwife (CNM)', title:'Certified Nurse Midwife (CNM)'},
                {key:'Other Midwifen', title:'Other Midwifen'},
                {key:'Other', title:'Other'},
                {key:'Unknown or not stated', title:'Unknown or not stated'}
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

                {key: 'mother_age', title: 'label.filter.ageOfMother', queryKey:"mother_age", primary: false, value: [],
                    defaultGroup:'column', groupBy: false, filterType: "checkbox", autoCompleteOptions: angular.copy(ageOptions)},

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

                {key: 'prenatal_care', title: 'label.filter.monthPrenatalCareBegan', queryKey:"prenatal_care",
                    primary: false, value: [], defaultGroup:'column', groupBy: false,
                    filterType: "checkbox", autoCompleteOptions: angular.copy(prenatalCareMonthOptions)},

                {key: 'birth_weight', title: 'label.filter.birthWeight', queryKey:"birth_weight", primary: false,
                    value: [], defaultGroup:'column', groupBy: false, filterType: "checkbox", autoCompleteOptions: angular.copy(birthWeightOptions)},

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

                {key: 'chronic_hypertension', title: 'label.filter.chronicHypertension', queryKey:"chronic_hypertension", primary: false,
                    value: [], defaultGroup:'column', groupBy: false, filterType: "checkbox", autoCompleteOptions: angular.copy(chronicHypertensionOptions)},

                {key: 'diabetes', title: 'label.filter.diabetes', queryKey:"diabetes", primary: false,
                    value: [], defaultGroup:'column', groupBy: false, filterType: "checkbox", autoCompleteOptions: angular.copy(diabetesOptions)},

                {key: 'pregnancy_hypertension', title: 'label.filter.pregnancy.hypertension', queryKey:"pregnancy_hypertension", primary: false,
                    value: [], defaultGroup:'column', groupBy: false, filterType: "checkbox", autoCompleteOptions: angular.copy(pregnancyHypertensionOptions)},

                {key: 'eclampsia', title: 'label.filter.eclampsia', queryKey:"eclampsia", primary: false, value: [],
                    defaultGroup:'column', groupBy: false, filterType: "checkbox",autoCompleteOptions: angular.copy(eclampsiaOptions)},

                {key: 'tobacco_use', title: 'label.filter.tobacco.use', queryKey:"tobacco_use", primary: false,
                    value: [], defaultGroup:'column', groupBy: false, filterType: "checkbox", autoCompleteOptions: angular.copy(tobaccoOptions)}
            ];

            return natalityFilters;
        }
    }

}());