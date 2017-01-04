(function(){
    angular
        .module('owh.search')
        .controller('SearchController', SearchController);

    SearchController.$inject = ['$scope', 'ModalService', 'utilService', 'searchFactory', '$rootScope',
        '$templateCache', '$compile', '$q', '$filter', 'leafletData', '$timeout', 'chartUtilService', 'shareUtilService',
        '$stateParams', '$state', 'xlsService', '$window'];

    function SearchController($scope, ModalService, utilService, searchFactory, $rootScope,
                                 $templateCache, $compile, $q, $filter, leafletData, $timeout, chartUtilService,
                                 shareUtilService, $stateParams, $state, xlsService, $window) {

        var sc = this;
        sc.downloadCSV = downloadCSV;
        sc.downloadXLS = downloadXLS;
        sc.getSelectedYears = getSelectedYears;
        sc.showPhaseTwoGraphs = showPhaseTwoGraphs;
        sc.showExpandedGraph = showExpandedGraph;
        sc.search = search;
        sc.showFbDialog = showFbDialog;
        sc.changeViewFilter = changeViewFilter;
        sc.getMixedTable = getMixedTable;
        sc.skipRefresh = false;

        var root = document.getElementsByTagName( 'html' )[0]; // '0' to assign the first (and only `HTML` tag)
        root.removeAttribute('class');
        var mortalityFilter = null;

        sc.sideMenu = {visible: true};
        //For intial search call
        if($stateParams.selectedFilters == null) {
            sc.filters = searchFactory.getAllFilters();
            sc.filters.primaryFilters = utilService.findAllByKeyAndValue(sc.filters.search, 'primary', true);
            mortalityFilter = utilService.findByKeyAndValue(sc.filters.primaryFilters, 'key', 'deaths');
            sc.filters.selectedPrimaryFilter = utilService.findByKeyAndValue(sc.filters.primaryFilters, 'key', $stateParams.primaryFilterKey);
        }
        //If user change filter then we are re routing search call and setting 'selectedFilters' and 'allFilters' params at line
        else {
            sc.filters = $stateParams.allFilters;
            sc.filters.primaryFilters = utilService.findAllByKeyAndValue(sc.filters.search, 'primary', true);
            mortalityFilter = utilService.findByKeyAndValue(sc.filters.primaryFilters, 'key', 'deaths');
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
            "label.risk.behavior": ['year', 'yrbsSex', 'yrbsRace', 'yrbsGrade', 'question'],
            "label.census.bridge.race.pop.estimate": ['current_year', 'sex', 'agegroup', 'race', 'ethnicity', 'state']
        };

        sc.optionsGroup = {
            "number_of_deaths": {
                "hispanicOrigin": [
                    {
                        "options": ['Central and South American', 'Central American', 'Cuban', 'Dominican', 'Latin American', 'Mexican', 'Puerto Rican', 'South American', 'Spaniard', 'Other Hispanic'],
                        "title": "Hispanic",
                        "key": "Hispanic"
                    },
                    'Non-Hispanic',
                    'Unknown'
                ],
                "race": ['American Indian', 'Asian or Pacific Islander', 'Black', 'White', 'Other (Puerto Rico only)'],
                "year": ['2015', '2014', '2013', '2012', '2011', '2010', '2009', '2008', '2007', '2006', '2005', '2004', '2003', '2002', '2001', '2000', '1999', '1997','1995','1993','1991' ]
            },
            "crude_death_rates": {
                "hispanicOrigin": ['hispanic', 'non', 'unknown'],
                "race": ['American Indian', 'Asian or Pacific Islander', 'Black', 'White', 'Other (Puerto Rico only)'],
                "year": ['2015', '2014', '2013', '2012', '2011', '2010', '2009', '2008', '2007', '2006', '2005', '2004', '2003', '2002', '2001', '2000']
            },
            "age-adjusted_death_rates": {
                "race": ['American Indian', 'Asian or Pacific Islander', 'Black', 'White', 'Other (Puerto Rico only)'],
                "year": ['2015', '2014', '2013', '2012', '2011', '2010', '2009', '2008', '2007', '2006', '2005', '2004', '2003', '2002', '2001', '2000']
            },
            bridge_race:{},
            mental_health:{}
        };
        //show certain filters for different table views
        sc.availableFilters = {
            'crude_death_rates': ['year', 'gender', 'race', 'hispanicOrigin'],
            'age-adjusted_death_rates': ['year', 'gender', 'race']
        };
        sc.queryID = $stateParams.queryID;
        sc.tableView = $stateParams.tableView ? $stateParams.tableView : sc.showMeOptions[0].key;

        if(sc.queryID === "") {
            searchFactory.generateHashCode(sc.filters.selectedPrimaryFilter).then(function(hash){
                sc.queryID = hash;
                $state.go('search', {queryID: sc.queryID});
            });
        }
        /*
        * To populate autoCompleteOptions from $rootScope
        * When we refresh search page, below listener populate autoCompleteOptions value with $rootScope.questionsList
         */
        $scope.$on('yrbsQuestionsLoadded', function() {
            sc.filters.yrbsFilters[4].autoCompleteOptions = $rootScope.questionsList;
        });



        /**************************************************/
        var mapExpandControl =  L.Control.extend({
            options: {
                position: 'topright'
            },
            onAdd: function (map) {
                var container = L.DomUtil.create('div', 'leaflet-bar leaflet-control leaflet-control-custom fa fa-expand fa-2x purple-icon');
                container.onclick = function(event){
                    if (sc.selectedMapSize==="small") {
                        sc.selectedMapSize = "big";
                        resizeUSAMap(true);
                        angular.element(container).removeClass('fa-expand');
                        angular.element(container).addClass('fa-compress');
                    } else if(sc.selectedMapSize==="big"){
                        sc.selectedMapSize = "small";
                        resizeUSAMap(false);
                        angular.element(container).removeClass('fa-compress');
                        angular.element(container).addClass('fa-expand');
                    } else{
                        sc.selectedMapSize = "small";
                        resizeUSAMap(false);
                        angular.element(container).removeClass('fa-compress');
                        angular.element(container).addClass('fa-expand');
                    }
                };
                return container;
            }
        });

        var mapShareControl =  L.Control.extend({
            options: {
                position: 'topright'
            },
            onAdd: function (map) {
                var container = L.DomUtil.create('div', 'leaflet-bar leaflet-control leaflet-control-custom fa fa-share-alt fa-2x purple-icon');
                container.onclick = function(event){
                    angular.element(document.getElementById('spindiv')).removeClass('ng-hide');
                    leafletData.getMap().then(function(map) {
                        leafletImage(map, function(err, canvas) {
                            sc.showFbDialog('chart_us_map', 'OWH - Map', canvas.toDataURL());
                        });
                    });

                };
                return container;
            }
        });

        function resizeUSAMap(isZoomIn) {
            leafletData.getMap().then(function(map) {
                if(isZoomIn) {
                    map.zoomIn();
                    angular.extend(sc.filters.selectedPrimaryFilter.mapData, {
                        legend: generateLegend(sc.filters.selectedPrimaryFilter.mapData.mapMinValue, sc.filters.selectedPrimaryFilter.mapData.mapMaxValue)
                    });
                } else {
                    sc.filters.selectedPrimaryFilter.mapData.legend = undefined;
                    map.zoomOut();
                }
                $timeout(function(){ map.invalidateSize()}, 1000);
            });

        }
        /**************************************************/
        if (sc.queryID) {
            searchFactory.getQueryResults(sc.queryID).then(function (response) {
                if(response.data) {
                    for(var i = 0; i < sc.filters.primaryFilters.length; i++) {
                        if(sc.filters.primaryFilters[i].key === response.data.queryJSON.key) {
                            sc.filters.selectedPrimaryFilter = sc.filters.primaryFilters[i];
                        }
                    }
                    //sc.filters.selectedPrimaryFilter = JSON.stringify(response.data.queryJSON);
                    sc.filters.selectedPrimaryFilter.allFilters = response.data.queryJSON.allFilters;
                    sc.filters.selectedPrimaryFilter.sideFilters = response.data.queryJSON.sideFilters;
                    // sc.filters.selectedPrimaryFilter.key = response.data.queryJSON.key;
                    sc.filters.selectedPrimaryFilter.title = response.data.queryJSON.title;

                   // sc.filters.selectedPrimaryFilter.mapData = response.data.queryJSON.mapData;
                    sc.filters.selectedPrimaryFilter.countLabel = response.data.queryJSON.countLabel;
                    sc.filters.selectedPrimaryFilter.primary = response.data.queryJSON.primary;
                    sc.filters.selectedPrimaryFilter.value = response.data.queryJSON.value;
                    sc.filters.selectedPrimaryFilter.header = response.data.queryJSON.header;

                    if(response.data.queryJSON.key == 'deaths') {
                        mortalityFilter = utilService.findByKeyAndValue(sc.filters.primaryFilters, 'key', 'deaths');
                        sc.filters.selectedPrimaryFilter.chartAxisLabel = response.data.queryJSON.chartAxisLabel;
                        //TODO: fix this
                        //sc.filters.selectedPrimaryFilter.mapData.controls.custom = response.data.queryJSON.mapData.controls.custom;
                        sc.filters.selectedPrimaryFilter.mapData = {};
                        //US-states map
                        angular.extend(sc.filters.selectedPrimaryFilter.mapData, {
                            usa: {
                                lat: 39,
                                lng: -100,
                                zoom: 3
                            },
                            legend: {},
                            defaults: {
                                tileLayer: "http://{s}.tile.opencyclemap.org/cycle/{z}/{x}/{y}.png",
                                scrollWheelZoom: false
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
                        });

                        sc.filters.selectedPrimaryFilter.mapData.defaults = response.data.queryJSON.mapData.defaults;
                        sc.filters.selectedPrimaryFilter.mapData.events = response.data.queryJSON.mapData.events;
                        sc.filters.selectedPrimaryFilter.mapData.legends = response.data.queryJSON.mapData.legends;
                        sc.filters.selectedPrimaryFilter.mapData.markers = response.data.queryJSON.mapData.markers;
                        sc.filters.selectedPrimaryFilter.mapData.usa = response.data.queryJSON.mapData.usa;

                        sc.filters.selectedPrimaryFilter.showMap = response.data.queryJSON.showMap;

                        sc.filters.selectedPrimaryFilter.searchResults = searchFactory.searchMortalityResults;

                        var headers = searchFactory.buildAPIQuery(response.data.queryJSON).headers;
                        var customResponse = {
                            data : response.data.resultData.nested.table,
                            dataPrepared : false,
                            headers : headers,
                            chartDataFromAPI : response.data.resultData.simple,
                            chartData: searchFactory.prepareChartData(headers, response.data.resultData.nested, sc.filters.selectedPrimaryFilter),
                            maps: response.data.resultData.nested.maps,
                            totalCount: response.pagination.total,
                            sideFilterResults: response.data.sideFilterResults,
                            queryJSON: response.data.queryJSON
                        };
                        searchFactory.prepareMortalityResults(sc.filters.selectedPrimaryFilter, customResponse);
                    }
                    else if(response.data.queryJSON.key == 'mental_health'){
                        sc.filters.selectedPrimaryFilter.additionalHeaders = response.data.queryJSON.additionalHeaders;
                        sc.filters.selectedPrimaryFilter.dontShowInlineCharting = response.data.queryJSON.dontShowInlineCharting;
                        sc.filters.selectedPrimaryFilter.initiated = response.data.queryJSON.initiated;
                        sc.filters.selectedPrimaryFilter.searchResults = searchFactory.searchYRBSResults;
                        sc.filters.selectedPrimaryFilter.data = response.data.resultData.table;
                        sc.filters.selectedPrimaryFilter.headers = searchFactory.buildQueryForYRBS(response.data.queryJSON, true).headers;
                    }
                    mortalityAndYRBSSearchResults(response);
                }
                else {
                    search(false);
                }
            });
        }

        $scope.$watch('sc.filters.selectedPrimaryFilter.key', function (newValue, oldValue) {
            if(newValue !== oldValue) {
                //update table view each time when filter changes
                sc.tableView = sc.filters.selectedPrimaryFilter.tableView;
                search(true);
            }
        }, true);

        function changeViewFilter(selectedFilter) {
            searchFactory.removeDisabledFilters(sc.filters.selectedPrimaryFilter, selectedFilter.key, sc.availableFilters);
            angular.forEach(sc.filters.selectedPrimaryFilter.allFilters, function(filter) {
                if(filter.key === 'hispanicOrigin') {
                    if(selectedFilter.key === 'crude_death_rates') {
                        filter.queryKey = 'ethnicity_group';
                        filter.autoCompleteOptions = sc.filters.ethnicityGroupOptions;
                    } else {
                        filter.queryKey = 'hispanicOrigin';
                        filter.autoCompleteOptions = sc.filters.hispanicOptions;
                    }
                }
            });
            angular.forEach(sc.filters.selectedPrimaryFilter.sideFilters, function(filter) {
                if(filter.filters.key === 'hispanicOrigin') {
                    if(selectedFilter.key === 'crude_death_rates') {
                        filter.filters.queryKey = 'ethnicity_group';
                        filter.filters.autoCompleteOptions = sc.filters.ethnicityGroupOptions;
                    } else {
                        filter.filters.queryKey = 'hispanicOrigin';
                        filter.filters.autoCompleteOptions = sc.filters.hispanicOptions;
                    }
                }
            });
            sc.search(true);
            sc.tableView = selectedFilter.key;
        }

        function search(isFilterChanged) {
            //TODO: would be better if there was a way to filter using query but also get all possible values back from api
            if (isFilterChanged && !$rootScope.requestProcessing) {
                // sc.sideFilterQuery = true;
                searchFactory.generateHashCode(sc.filters.selectedPrimaryFilter).then(function (hash) {
                    sc.queryID = hash;
                    $state.go('search', {
                        queryID: sc.queryID,
                        allFilters: sc.filters,
                        selectedFilters: sc.filters.selectedPrimaryFilter,
                        tableView: sc.tableView
                    });
                });
            }
            else {
                console.log('filter', angular.copy(sc.filters.selectedPrimaryFilter));
                for (var key in sc.filters.selectedPrimaryFilter) {
                    if (sc.filters.selectedPrimaryFilter.hasOwnProperty(key)) {
                        console.log(key);
                        JSON.stringify(sc.filters.selectedPrimaryFilter[key]);
                    }
                }
                primaryFilterChanged(sc.filters.selectedPrimaryFilter, sc.queryID);
            }
        }

        function downloadCSV() {
            var data = sc.getMixedTable(sc.filters.selectedPrimaryFilter);
            addRowHeaders(data, sc.filters.selectedPrimaryFilter);
            var filename = getFilename(sc.filters.selectedPrimaryFilter);
            xlsService.exportCSVFromMixedTable(data, filename);
        }

        function downloadXLS() {
            var data = sc.getMixedTable(sc.filters.selectedPrimaryFilter);
            addRowHeaders(data, sc.filters.selectedPrimaryFilter);
            var filename = getFilename(sc.filters.selectedPrimaryFilter);
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

        function getMixedTable(selectedFilter){
            var file = selectedFilter.data ? selectedFilter.data : {};
            var headers = selectedFilter.headers ? selectedFilter.headers : {columnHeaders: [], rowHeaders: []};
            //make sure row/column headers are in proper order
            angular.forEach(headers.rowHeaders, function(header) {
                searchFactory.sortAutoCompleteOptions(header, sc.optionsGroup[sc.tableView]);
            });
            angular.forEach(headers.columnHeaders, function(header) {
                searchFactory.sortAutoCompleteOptions(header, sc.optionsGroup[sc.tableView]);
            });
            var countKey = selectedFilter.key;
            var countLabel = selectedFilter.countLabel;
            var totalCount = selectedFilter.count;
            var calculatePercentage = selectedFilter.calculatePercentage;
            var calculateRowTotal = selectedFilter.calculateRowTotal;
            var secondaryCountKeys = ['pop', 'ageAdjustedRate', 'standardPop'];

            return utilService.prepareMixedTableData(headers, file, countKey, totalCount, countLabel, calculatePercentage, calculateRowTotal, secondaryCountKeys);
        }

        function getFilename(selectedFilter) {
            //get year range
            var yearRange = '';
            angular.forEach(selectedFilter.allFilters, function(filter) {
                if(filter.key === 'year') {
                    if(filter.value.length > 1) {
                        var minYear = parseInt(filter.value[0], 10);
                        var maxYear = parseInt(filter.value[0], 10);
                        angular.forEach(filter.value, function(year) {
                            var yearInt = parseInt(year, 10);
                            if(yearInt < minYear) {
                                minYear = yearInt;
                            }
                            if(yearInt > maxYear) {
                                maxYear = yearInt;
                            }
                        });
                        yearRange = minYear + '-' + maxYear;
                    } else if(filter.value.length === 1) {
                        //only one year selected
                        yearRange = filter.value[0];
                    } else {
                        //use all if none selected
                        yearRange = 'All';
                    }

                }
            });
            return selectedFilter.header + '_' + yearRange + '_Filtered';
        }

        //takes mixedTable and returns categories array for use with owhAccordionTable
        function categorizeQuestions(data) {
            var categories = [];
            angular.forEach($rootScope.questions, function(questionCategory){
                var category = {title: questionCategory.text, questions: [], hide: true};
                angular.forEach(questionCategory.children, function(categoryChild) {
                    angular.forEach(data, function(row) {
                        if(row[0].qkey === categoryChild.id) {
                          category.questions.push(row);
                        }
                    });
                });
                categories.push(category);
            });
            return categories;
        }

        function mortalityAndYRBSSearchResults(response) {
            //populate side filters based on cached query filters
            if (response.queryJSON) {
                angular.forEach(response.queryJSON.sideFilters, function (filter, index) {
                    sc.filters.selectedPrimaryFilter.sideFilters[index].filters.value = filter.filters.value;
                    sc.filters.selectedPrimaryFilter.sideFilters[index].filters.groupBy = filter.filters.groupBy;
                });
            }
            searchFactory.updateFilterValues(sc.filters.selectedPrimaryFilter);
            //update table headers based on cached query
            sc.filters.selectedPrimaryFilter.headers = searchFactory.buildAPIQuery(sc.filters.selectedPrimaryFilter).headers;
            //make sure side filters are in proper order
            angular.forEach(sc.filters.selectedPrimaryFilter.sideFilters, function (filter) {
                searchFactory.groupAutoCompleteOptions(filter.filters, sc.optionsGroup[sc.tableView]);
            });

            sc.tableData = getMixedTable(sc.filters.selectedPrimaryFilter);
            if (sc.filters.selectedPrimaryFilter.key === 'deaths') {
                updateStatesDeaths(sc.filters.selectedPrimaryFilter.maps, sc.filters.selectedPrimaryFilter.searchCount);
            }
            if (sc.filters.selectedPrimaryFilter.key === 'mental_health') {
                sc.filters.selectedPrimaryFilter.headers = sc.tableData.headers;
                sc.filters.selectedPrimaryFilter.data = categorizeQuestions(sc.tableData.data);
            }
            if (sc.filters.selectedPrimaryFilter.key === 'bridge_race') {
                sc.filters.selectedPrimaryFilter.headers = sc.tableData.headers;
                sc.filters.selectedPrimaryFilter.data = sc.tableData.data;
            }
            sc.filters.selectedPrimaryFilter.initiated = true;
        }

        function primaryFilterChanged(newFilter, queryID) {
            utilService.updateAllByKeyAndValue(sc.filters.search, 'initiated', false);
            //TODO: this executes the actualy query, only perform this when queryId is present
            sc.filters.selectedPrimaryFilter.searchResults(sc.filters.selectedPrimaryFilter, queryID).then(function(response) {
                mortalityAndYRBSSearchResults(response);
            });
        }

        function getSelectedYears() {
            var yearFilter = utilService.findByKeyAndValue(sc.filters.selectedPrimaryFilter.allFilters, 'key', 'year');
            if (yearFilter) {
                return utilService.isValueNotEmpty(yearFilter.value) ? yearFilter.value : utilService.getValuesByKey(yearFilter.autoCompleteOptions, 'title');
            }
        }

        function showPhaseTwoGraphs(text) {
            searchFactory.showPhaseTwoModal(text);
        }


        //US-states map
        angular.extend(mortalityFilter.mapData, {
            usa: {
                lat: 39,
                lng: -100,
                zoom: 3
            },
            legend: {},
            defaults: {
                tileLayer: "http://{s}.tile.opencyclemap.org/cycle/{z}/{x}/{y}.png",
                scrollWheelZoom: false
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
        });

        function updateStatesDeaths(data, totalCount) {
            var years = sc.getSelectedYears;
           //update states info with trials data
            var stateDeathTotals = [];
            angular.forEach($rootScope.states.features, function(feature){
                var state = utilService.findByKeyAndValue(data.states, 'name', feature.properties.name);
                if (utilService.isValueNotEmpty(state)){
                    stateDeathTotals.push(state['deaths']);
                    feature.properties.years = years;
                    feature.properties.totalCount = state['deaths']; /*+ (Math.floor((Math.random()*10)+1))*100000;*/
                    feature.properties.sex = state.sex;
                }
            });
            var minMaxValueObj = utilService.getMinAndMaxValue(stateDeathTotals);
            angular.extend(sc.filters.selectedPrimaryFilter.mapData, {
                mapMaxValue : minMaxValueObj.maxValue,
                mapMinValue : minMaxValueObj.minValue
            });
            //update legend values on filtering..
            if (sc.selectedMapSize==="big") {
                angular.extend(sc.filters.selectedPrimaryFilter.mapData, {
                    legend: generateLegend(minMaxValueObj.minValue, minMaxValueObj.maxValue)
                });
            }

            angular.extend(sc.filters.selectedPrimaryFilter.mapData, {
                geojson: {
                    data: $rootScope.states,
                    style: style
                },
                mapTotalCount: totalCount
            });

        }
        //generate labels for map legend labels
        function getLabels(minValue, maxValue) {
            return utilService.generateMapLegendLabels(minValue, maxValue);
        }

        //return legend configuration parameters
        function generateLegend(minValue, maxValue){
            return {
                position: 'bottomleft',
                colors: ['#00374d','#005b80','#006e99','#0080b3','#0092cc','#00a4e6','#00b7ff','#1abeff','#4dccff','#80dbff','#b3e9ff'],
                labels: getLabels(minValue, maxValue)
            }
        }

        //get map feature colors
        function getColor(d) {
            var ranges = utilService.generateMapLegendRanges(sc.filters.selectedPrimaryFilter.mapData.mapMinValue,
                sc.filters.selectedPrimaryFilter.mapData.mapMaxValue);
            return d > ranges[10] ? '#00374d' :
                d > ranges[9]  ? '#005b80' :
                d > ranges[8]  ? '#006e99' :
                d > ranges[7]  ? '#0080b3' :
                d > ranges[6]  ? '#0092cc' :
                d > ranges[5]  ? '#00a4e6' :
                d > ranges[4]  ? '#00b7ff' :
                d > ranges[3]  ? '#1abeff' :
                d > ranges[2]  ? '#4dccff' :
                d > ranges[1]  ? '#80dbff' : '#b3e9ff';
        }

        //return map feature styling configuration parameters
        function style(feature) {
            return {
                fillColor: getColor(feature.properties.totalCount),
                weight: 2,
                opacity: 1,
                color: 'white',
                dashArray: '3',
                fillOpacity: 0.7
            };
        }

        //builds marker popup.
        function buildMarkerPopup(lat, lng, properties, map) {
            var childScope = $scope.$new();
            childScope.lat = lat;
            childScope.lng = lng;
            childScope.properties = properties;
            var ele = angular.element('<div></div>');
            ele.html($templateCache.get('app/partials/marker-template.html'));
            var compileEle = $compile(ele.contents())(childScope);
            L.popup()
                .setContent(compileEle[0])
                .setLatLng(L.latLng(lat, lng)).openOn(map)
        }
        $scope.$on("leafletDirectiveGeoJson.click", function (event, args) {
            var leafEvent = args.leafletEvent;
            buildMarkerPopup(leafEvent.latlng.lat, leafEvent.latlng.lng, leafEvent.target.feature.properties, args.leafletObject._map);
        });

        /**
         * Shows facebook share dialog box
         */
        function showFbDialog(svgIndex, title, data) {
            shareUtilService.shareOnFb(svgIndex, title, undefined, undefined, data);
        }

        /*Show expanded graphs with whole set of features*/
        function showExpandedGraph(chartData) {
            chartUtilService.showExpandedGraph([chartData]);
        }
    }
}());
