(function(){
    angular
        .module('owh.search')
        .controller('SearchController', SearchController);

    SearchController.$inject = ['$scope', 'ModalService', 'utilService', 'searchFactory', '$rootScope',
        '$templateCache', '$compile', '$q', '$filter', 'leafletData', '$timeout', 'chartUtilService', 'shareUtilService',
        '$stateParams', '$state', 'xlsService', '$window', 'mapService'];

    function SearchController($scope, ModalService, utilService, searchFactory, $rootScope,
                                 $templateCache, $compile, $q, $filter, leafletData, $timeout, chartUtilService,
                                 shareUtilService, $stateParams, $state, xlsService, $window, mapService) {

        var sc = this;
        sc.downloadCSV = downloadCSV;
        sc.downloadXLS = downloadXLS;
        sc.showPhaseTwoGraphs = showPhaseTwoGraphs;
        sc.showExpandedGraph = showExpandedGraph;
        sc.search = search;
        sc.changeViewFilter = changeViewFilter;
        sc.getQueryResults = getQueryResults;
        sc.changePrimaryFilter = changePrimaryFilter;
        sc.updateCharts = updateCharts;
        sc.getChartTitle = getChartTitle;
        sc.skipRefresh = false;
        sc.switchToYRBSBasic = switchToYRBSBasic;
        sc.switchToYRBSAdvanced = switchToYRBSAdvanced;

        var root = document.getElementsByTagName( 'html' )[0]; // '0' to assign the first (and only `HTML` tag)
        root.removeAttribute('class');
        var mortalityFilter = null;
        var bridgedRaceFilter = null;

        sc.sideMenu = {visible: true};
        sc.mapOptions = {selectedMapSize: 'small'};
        //For intial search call
        if($stateParams.selectedFilters == null) {
            sc.filters = searchFactory.getAllFilters();
            sc.filters.primaryFilters = utilService.findAllByKeyAndValue(sc.filters.search, 'primary', true);
            mortalityFilter = utilService.findByKeyAndValue(sc.filters.primaryFilters, 'key', 'deaths');
            bridgedRaceFilter = utilService.findByKeyAndValue(sc.filters.primaryFilters, 'key', 'bridge_race');
            sc.filters.selectedPrimaryFilter = utilService.findByKeyAndValue(sc.filters.primaryFilters, 'key', $stateParams.primaryFilterKey);
        }
        //If user change filter then we are re routing search call and setting 'selectedFilters' and 'allFilters' params at line
        else {
            sc.filters = $stateParams.allFilters;
            sc.filters.primaryFilters = utilService.findAllByKeyAndValue(sc.filters.search, 'primary', true);
            mortalityFilter = utilService.findByKeyAndValue(sc.filters.primaryFilters, 'key', 'deaths');
            bridgedRaceFilter = utilService.findByKeyAndValue(sc.filters.primaryFilters, 'key', 'bridge_race');
            sc.filters.selectedPrimaryFilter = $stateParams.selectedFilters;
        }

        sc.selectedMapSize = 'small';
        sc.showMeOptions = [
            {key: 'number_of_deaths', title: 'Number of Deaths'},
            {key: 'crude_death_rates', title: 'Crude Death Rates'},
            {key: 'age-adjusted_death_rates', title: 'Age Adjusted Death Rates'}
        ];
        sc.sort = {
            "label.filter.mortality": ['year', 'gender', 'race', 'hispanicOrigin', 'agegroup', 'autopsy', 'placeofdeath', 'weekday', 'month', 'ucd-filters', 'mcd-filters'],
            "label.risk.behavior": ['year', 'yrbsSex', 'yrbsRace', 'yrbsGrade', 'yrbsState', 'question'],
            "label.census.bridge.race.pop.estimate": ['current_year', 'sex', 'agegroup', 'race', 'ethnicity', 'state'],
            "label.filter.natality": ['dob_yy', 'sex', 'mother_race', 'hispanic_origin', 'marital_status',
                'mother_age', 'mother_education', 'dob_mm', 'dob_wk', 'prenatal_care',
                'birth_weight', 'birth_plurality', 'live_birth', 'birth_place', 'delivery_method', 'medical_attendant',
                'chronic_hypertension', 'diabetes', 'pregnancy_hypertension', 'eclampsia', 'tobacco_use']
        };

        sc.optionsGroup = {
            "number_of_deaths": {
                "hispanicOrigin": [
                    'Non-Hispanic',
                    {
                        "options": ['Central and South American', 'Central American', 'Cuban', 'Dominican', 'Latin American', 'Mexican', 'Puerto Rican', 'South American', 'Spaniard', 'Other Hispanic'],
                        "title": "Hispanic",
                        "key": "Hispanic"
                    },
                    'Unknown'
                ],
                "race": ['American Indian', 'Asian or Pacific Islander', 'Black', 'White', 'Other (Puerto Rico only)'],
                "year": ['2015', '2014', '2013', '2012', '2011', '2010', '2009', '2008', '2007', '2006', '2005', '2004', '2003', '2002', '2001', '2000', '1999', '1997','1995','1993','1991' ]
            },
            "crude_death_rates": {
                "hispanicOrigin": ['Non-Hispanic', 'Hispanic', 'Unknown'],
                "race": ['American Indian', 'Asian or Pacific Islander', 'Black', 'White', 'Other (Puerto Rico only)'],
                "year": ['2015', '2014', '2013', '2012', '2011', '2010', '2009', '2008', '2007', '2006', '2005', '2004', '2003', '2002', '2001', '2000']
            },
            "age-adjusted_death_rates": {
                "hispanicOrigin": ['Non-Hispanic', 'Hispanic', 'Unknown'],
                "race": ['American Indian', 'Asian or Pacific Islander', 'Black', 'White', 'Other (Puerto Rico only)'],
                "year": ['2015', '2014', '2013', '2012', '2011', '2010', '2009', '2008', '2007', '2006', '2005', '2004', '2003', '2002', '2001', '2000']
            },
            bridge_race:{},
            mental_health:{},
            natality:{}
        };
        //show certain filters for different table views
        sc.availableFilters = {
            'crude_death_rates': ['year', 'gender', 'race', 'hispanicOrigin'],
            'age-adjusted_death_rates': ['year', 'gender', 'race', 'hispanicOrigin']
        };

        //functionality to be added to the side filters
        sc.filterUtilities = {
            'mental_health': [
                {
                    title: 'Variance',
                    options: [
                        {
                            title: 'Confidence Intervals',
                            type: 'toggle',
                            value: false,
                            onChange: function(value) {
                                sc.showConfidenceIntervals = value;
                            },
                            options: [
                                {
                                    title: 'label.mortality.search.table.show.percentage.button',
                                    key: true
                                },
                                {
                                    title: 'label.mortality.search.table.hide.percentage.button',
                                    key: false
                                }
                            ]
                        },
                        {
                            title: 'Unweighted Frequency',
                            type: 'toggle',
                            value: false,
                            onChange: function(value) {
                                sc.showUnweightedFrequency = value;
                            },
                            options: [
                                {
                                    title: 'label.mortality.search.table.show.percentage.button',
                                    key: true
                                },
                                {
                                    title: 'label.mortality.search.table.hide.percentage.button',
                                    key: false
                                }
                            ]
                        }
                    ]
                }
            ]
        };
        sc.queryID = $stateParams.queryID;
        sc.tableView = $stateParams.tableView ? $stateParams.tableView : sc.showMeOptions[0].key;
        //this flags whether to cache the incoming filter query
        sc.cacheQuery = $stateParams.cacheQuery;

        function changePrimaryFilter(newFilter) {
            sc.tableData = {};
            sc.filters.selectedPrimaryFilter = newFilter;
            search(true);
        }

        function setDefaults() {
            sc.filters.selectedPrimaryFilter = mortalityFilter;
            var yearFilter = utilService.findByKeyAndValue(sc.filters.selectedPrimaryFilter.allFilters, 'key', 'year');
            yearFilter.value.push('2014');
        }

        if(sc.queryID === '') {
            //queryID is empty, run the default query
            setDefaults();
            search(true);
        } else if(sc.queryID) {
            // queryID is present, try to get the cached query
            // Disable SelectedPrimaryFilter watch so that the dataset change events is not trigger
            // while updating the view with the cached result
            getQueryResults(sc.queryID).then(function (response) {
                if (!response.data) {
                    if(!sc.cacheQuery) {
                        // redirect to default query if we were tryint to retrieve a cached query
                        // and was not found in the cache
                        $window.alert('Query ' + sc.queryID + ' could not be found');
                        $state.go('search', {
                            queryID: ''
                        });
                    } else {
                        //run a search, if user was not trying retrieve a cached query
                        search(false);
                    }

                }
                // Enable the SelectedPrimaryFilter watch
            });

        }

        function search(isFilterChanged) {
            //TODO: $rootScope.requestProcessing is keeping this from running on initialization, do we need that check?
            // if(isFilterChanged && !$rootScope.requestProcessing) {
            if(isFilterChanged) {
                //filters changed
                searchFactory.generateHashCode(sc.filters.selectedPrimaryFilter).then(function(hash) {
                    //after generating query hash, redirect and flag
                    $state.go('search', {
                        queryID: hash,
                        allFilters: sc.filters,
                        selectedFilters: sc.filters.selectedPrimaryFilter,
                        primaryFilterKey: sc.filters.selectedPrimaryFilter.key,
                        tableView: sc.tableView,
                        cacheQuery: true
                    });
                });
            } else {
                primaryFilterChanged(sc.filters.selectedPrimaryFilter, sc.queryID);
            }
        }

        /*
        * To populate autoCompleteOptions from $rootScope
        * When we refresh search page, below listener populate autoCompleteOptions value with $rootScope.questionsList
         */
        $scope.$on('yrbsQuestionsLoadded', function() {
            sc.filters.yrbsBasicFilters[4].autoCompleteOptions = $rootScope.questionsList;
            sc.filters.yrbsAdvancedFilters[4].autoCompleteOptions = $rootScope.questionsList;
        });


        /**************************************************/
        var mapExpandControl = mapService.addExpandControl(sc.mapOptions, sc.filters.selectedPrimaryFilter);

        var mapShareControl = mapService.addShareControl();

        /**************************************************/
        //US-states map
        var mapOptions = {
            usa: {
                lat: 39,
                lng: -97,
                zoom: 3
            },
            legend: {},
            defaults: {
                tileLayer: "http://{s}.tile.opencyclemap.org/cycle/{z}/{x}/{y}.png",
                scrollWheelZoom: false,
                minZoom: 2,
                maxZoom: 6
            },
            markers: {},
            events: {
                map: {
                    enable: ['click'],
                    logic: 'emit'
                }
            },
            controls: {
                custom: [new mapExpandControl(), new mapShareControl()]
            },
            isMap:true
        }
        angular.extend(mortalityFilter.mapData, mapOptions);

        angular.extend(bridgedRaceFilter.mapData, mapOptions);

        function updateCharts() {
            angular.forEach(sc.filters.selectedPrimaryFilter.chartData, function (chartData) {
                angular.forEach(chartData, function (chart) {
                    if (!chart.isMap) {
                        $timeout(function () {
                            chart.api.update();
                        }, 250);
                    }
                });
            });
        }

        //fit leaflet map to container
        $timeout(function(){
            leafletData.getMap().then(function(map) {
                map.invalidateSize()
            });
        }, 1700);

        function getQueryResults(queryID) {
            return searchFactory.getQueryResults(queryID).then(function (response) {
               //if queryID exists in owh_querycache index, then update data that are required to display search results
                if (response.data) {
                    var result = searchFactory.updateFiltersAndData(sc.filters.primaryFilters, response, sc.optionsGroup, sc.mapOptions);
                    sc.tableView = result.tableView;
                    sc.tableData = result.tableData;
                    sc.filters.selectedPrimaryFilter = result.primaryFilter;
                }
                return response;
            });
        }



        function changeViewFilter(selectedFilter) {
            searchFactory.removeDisabledFilters(sc.filters.selectedPrimaryFilter, selectedFilter.key, sc.availableFilters);
            angular.forEach(sc.filters.selectedPrimaryFilter.allFilters, function(filter) {
                if(filter.key === 'hispanicOrigin') {
                    if(selectedFilter.key === 'crude_death_rates' || selectedFilter.key === 'age-adjusted_death_rates') {
                        filter.queryKey = 'ethnicity_group';
                        filter.autoCompleteOptions = sc.filters.ethnicityGroupOptions;
                    } else {
                        filter.queryKey = 'hispanic_origin';
                        filter.autoCompleteOptions = sc.filters.hispanicOptions;
                    }
                }
            });
            angular.forEach(sc.filters.selectedPrimaryFilter.sideFilters, function(filter) {
                if(filter.filters.key === 'hispanicOrigin') {
                    if(selectedFilter.key === 'crude_death_rates' || selectedFilter.key === 'age-adjusted_death_rates') {
                        filter.filters.queryKey = 'ethnicity_group';
                        filter.filters.autoCompleteOptions = sc.filters.ethnicityGroupOptions;
                    } else {
                        filter.filters.queryKey = 'hispanic_origin';
                        filter.filters.autoCompleteOptions = sc.filters.hispanicOptions;
                    }
                }
            });
            sc.filters.selectedPrimaryFilter.tableView = selectedFilter.key;
            sc.search(true);
            sc.tableView = selectedFilter.key;
        }

        function downloadCSV() {
            var data = searchFactory.getMixedTable(sc.filters.selectedPrimaryFilter, sc.optionsGroup, sc.tableView);
            addRowHeaders(data, sc.filters.selectedPrimaryFilter);
            var filename = xlsService.getFilename(sc.filters.selectedPrimaryFilter);
            xlsService.exportCSVFromMixedTable(data, filename);
        }

        function downloadXLS() {
            var data = searchFactory.getMixedTable(sc.filters.selectedPrimaryFilter, sc.optionsGroup, sc.tableView);
            addRowHeaders(data, sc.filters.selectedPrimaryFilter);
            var filename = xlsService.getFilename(sc.filters.selectedPrimaryFilter);
            xlsService.exportXLSFromMixedTable(data, filename);
        }

        function addRowHeaders(mixedTable, selectedFilter) {
            //add row headers so we can properly repeat row header merge cells, and also for adding % columns
            mixedTable.rowHeaders = [];
            angular.forEach(selectedFilter.value, function(filter, idx) {
                if(filter.groupBy === 'row') {
                    mixedTable.rowHeaders.push(filter);
                }
            });
        }



        /**
         * This method getting called when filters changed
         * This function get
         * @param newFilter
         * @param queryID
         */
        function primaryFilterChanged(newFilter, queryID) {
            utilService.updateAllByKeyAndValue(sc.filters.search, 'initiated', false);
            return sc.filters.selectedPrimaryFilter.searchResults(sc.filters.selectedPrimaryFilter, queryID).then(function(response) {
                var result = searchFactory.updateFiltersAndData(sc.filters.primaryFilters, response, sc.optionsGroup, sc.mapOptions);
                sc.tableView = result.tableView;
                sc.tableData = result.tableData;
                sc.filters.selectedPrimaryFilter = result.primaryFilter;
            });
        }

        function showPhaseTwoGraphs(text) {
            searchFactory.showPhaseTwoModal(text);
        }

        //builds marker popup.
        sc.mapPopup = L.popup({autoPan: false});
        sc.currentFeature = {};
        function buildMarkerPopup(lat, lng, properties, map, tableView) {
            var childScope = $scope.$new();
            childScope.lat = lat;
            childScope.lng = lng;
            childScope.properties = properties;
            childScope.tableView = tableView;
            var ele = angular.element('<div></div>');
            ele.html($templateCache.get('app/partials/marker-template.html'));
            var compileEle = $compile(ele.contents())(childScope);
            if(sc.currentFeature.properties !== properties || !sc.mapPopup._isOpen) {
                sc.mapPopup
                    .setContent(compileEle[0])
                    .setLatLng(L.latLng(lat, lng)).openOn(map);
            } else {
                sc.mapPopup
                    .setLatLng(L.latLng(lat, lng));
            }

        }
        $scope.$on("leafletDirectiveGeoJson.mouseover", function (event, args) {
            var leafEvent = args.leafletEvent;
            buildMarkerPopup(leafEvent.latlng.lat, leafEvent.latlng.lng, leafEvent.target.feature.properties, args.leafletObject._map, sc.filters.selectedPrimaryFilter.key);
            sc.currentFeature = leafEvent.target.feature;

        });
        $scope.$on("leafletDirectiveGeoJson.mouseout", function (event, args) {
            sc.mapPopup._close();
        });
        $scope.$on("leafletDirectiveMap.mouseout", function (event, args) {
            sc.mapPopup._close();
        });

        /*Show expanded graphs with whole set of features*/
        function showExpandedGraph(chartData) {
            chartUtilService.showExpandedGraph([chartData]);
        }

        function getChartTitle(title) {
            var filters = title.split('.');
            filters = filters.slice(2);
            if (filters.length > 1) {
                return $filter('translate')('label.chart.' + filters[0]) + ' and ' + $filter('translate')('label.chart.' + filters[1]);
            } else {
                return $filter('translate')('label.chart.' + filters[0]);
            }
        }

        /**
         * Switch to YRBS basic filter
         */
        function switchToYRBSBasic(){
            sc.filters.selectedPrimaryFilter.showBasicSearchSideMenu = true;
            sc.filters.selectedPrimaryFilter.runOnFilterChange = true;
            sc.filters.selectedPrimaryFilter.allFilters = sc.filters.yrbsBasicFilters;
            sc.filters.selectedPrimaryFilter.sideFilters = sc.filters.search[1].basicSideFilters;
            sc.search(true);
        }

        /**
         * Switch to YRBS advanced filter
         */
        function switchToYRBSAdvanced(){
            sc.filters.selectedPrimaryFilter.showBasicSearchSideMenu = false;
            sc.filters.selectedPrimaryFilter.runOnFilterChange = false;
            sc.filters.selectedPrimaryFilter.allFilters = sc.filters.yrbsAdvancedFilters;
            sc.filters.selectedPrimaryFilter.sideFilters = sc.filters.search[1].advancedSideFilters;
            sc.search(true);
        }
    }
}());
