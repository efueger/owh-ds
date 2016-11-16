(function () {
    'use strict';

    angular
        .module('owh.services').
        service('filterUtils', filterUtils);

    filterUtils.$inject = [];

    /**
     * This utility service is used to prepare the OWH search filters.
     */
    function filterUtils() {
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
                { "key": "Black or African American", "title": "Black or African American" },
                { "key": "American Indian", "title": "American Indian" },
                { "key": "Asian or Pacific Islander", "title": "Asian or Pacific Islander" }
            ];

            var censusHispanicOriginOptions =  [
                { "key": "Non Hispanic", "title": "Non Hispanic" },
                { "key": "Hispanic or Latino", "title": "Hispanic or Latino" }
            ];

            var censusStateOptions =  [
                { "key": "01", "title": "01(Alabama)" },
                { "key": "02", "title": "02(Alaska)" },
                { "key": "04", "title": "04(Arizona)" },
                { "key": "05", "title": "05(Arkansas)" },
                { "key": "06", "title": "06(California)" },
                { "key": "08", "title": "08(Colorado)" },
                { "key": "09", "title": "09(Connecticut)" },
                { "key": "10", "title": "10(Delaware)" },
                { "key": "11", "title": "11(District of Columbia)" },
                { "key": "12", "title": "12(Florida)" },
                { "key": "13", "title": "13(Georgia)" },
                { "key": "15", "title": "15(Hawaii)" },
                { "key": "16", "title": "16(Idaho)" },
                { "key": "17", "title": "17(Illinois)" },
                { "key": "18", "title": "18(Indiana)"},
                { "key": "19", "title": "19(Iowa)" },
                { "key": "20", "title": "20(Kansas)" },
                { "key": "21", "title": "21(Kentucky)" },
                { "key": "22", "title": "22(Louisiana)" },
                { "key": "23", "title": "23(Maine)" },
                { "key": "24", "title": "24(Maryland)" },
                { "key": "25", "title": "25(Massachusetts)" },
                { "key": "26", "title": "26(Michigan)" },
                { "key": "27", "title": "27(Minnesota)" },
                { "key": "28", "title": "28(Mississippi)" },
                { "key": "29", "title": "29(Missouri)" },
                { "key": "30", "title": "30(Montana)" },
                { "key": "31", "title": "31(Nebraska)" },
                { "key": "32", "title": "32(Nevada)" },
                { "key": "33", "title": "33(New Hampshire)" },
                { "key": "34", "title": "34(New Jersey)" },
                { "key": "35", "title": "35(New Mexico)" },
                { "key": "36", "title": "36(New York)" },
                { "key": "37", "title": "37(North Carolina)" },
                { "key": "38", "title": "38(North Dakota)" },
                { "key": "39", "title": "39(Ohio)" },
                { "key": "40", "title": "40(Oklahoma)" },
                { "key": "41", "title": "41(Oregon)" },
                { "key": "42", "title": "42(Pennsylvania)" },
                { "key": "44", "title": "44(Rhode Island)" },
                { "key": "45", "title": "45(South Carolina)" },
                { "key": "46", "title": "46(South Dakota)" },
                { "key": "47", "title": "47(Tennessee)" },
                { "key": "48", "title": "48(Texas)" },
                { "key": "49", "title": "49(Utah)" },
                { "key": "50", "title": "50(Vermont)" },
                { "key": "51", "title": "51(Virginia)" },
                { "key": "53", "title": "53(Washington)" },
                { "key": "54", "title": "54(West Virginia)" },
                { "key": "55", "title": "55(Wisconsin)" },
                { "key": "56", "title": "56(Wyoming)" }
            ];

            var censusAgeOptions = [
                {key:'1',title:'01 years'},
                {key:'2',title:'02 years'},
                {key:'3',title:'03 years'},
                {key:'4',title:'04 years'},
                {key:'5',title:'05 years'},
                {key:'6',title:'06 years'},
                {key:'7',title:'07 years'},
                {key:'8',title:'08 years'},
                {key:'9',title:'09 years'},
                {key:'10',title:'10 years'},
                {key:'11',title:'11 years'},
                {key:'12',title:'12 years'},
                {key:'13',title:'13 years'},
                {key:'14',title:'14 years'},
                {key:'15',title:'15 years'},
                {key:'16',title:'16 years'},
                {key:'17',title:'17 years'},
                {key:'18',title:'18 years'},
                {key:'19',title:'19 years'},
                {key:'20',title:'20 years'},
                {key:'21',title:'21 years'},
                {key:'22',title:'22 years'},
                {key:'23',title:'23 years'},
                {key:'24',title:'24 years'},
                {key:'25',title:'25 years'},
                {key:'26',title:'26 years'},
                {key:'27',title:'27 years'},
                {key:'28',title:'28 years'},
                {key:'29',title:'29 years'},
                {key:'30',title:'30 years'},
                {key:'31',title:'31 years'},
                {key:'32',title:'32 years'}
            ];

            //prepare filter definitions
            var bridgeDataFilters = [
                {key: 'state', title: 'label.filter.state', queryKey:"state",primary: false, value:[], defaultGroup:'row', groupBy: false,
                    autoCompleteOptions: angular.copy(censusStateOptions)},
                {key: 'age', title: 'label.filter.age', queryKey:"age",primary: false, value:[], defaultGroup:'row', groupBy: false,
                    autoCompleteOptions: angular.copy(censusAgeOptions)},
                {key: 'race', title: 'label.filter.race', queryKey:"race",primary: false, defaultGroup:'column', groupBy: 'row',
                    autoCompleteOptions: angular.copy(censusRaceOptions), value:[]},
                {key: 'ethnicity', title: 'label.filter.hispanicOrigin', queryKey:"hispanic_origin",primary: false, defaultGroup:'row', groupBy: false,
                    autoCompleteOptions: angular.copy(censusHispanicOriginOptions), value:[]},
                {key: 'current_year', title: 'label.filter.yearly.estimate', queryKey:"current_year", primary: false, value: ['2000'], defaultGroup:'row', groupBy: false,
                    autoCompleteOptions: angular.copy(censusYearsOptions) },
                {key: 'sex', title: 'label.filter.gender', queryKey:"sex", primary: false, value: [], defaultGroup:'column', groupBy: 'column',
                    autoCompleteOptions: angular.copy(censusGenderOptions)}
            ];

            return bridgeDataFilters;
        }
    }

}());