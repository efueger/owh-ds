(function(){
    angular
        .module('owh.search')
        .controller('SearchController', SearchController);

    SearchController.$inject = ['$scope', 'ModalService', 'utilService', 'searchFactory', '$rootScope',
        '$templateCache', '$compile', '$q', '$filter', 'leafletData', '$timeout', 'chartUtilService', 'shareUtilService',
        '$stateParams', 'xlsService', '$window'];

    function SearchController($scope, ModalService, utilService, searchFactory, $rootScope,
                                 $templateCache, $compile, $q, $filter, leafletData, $timeout, chartUtilService,
                                 shareUtilService, $stateParams, xlsService, $window) {

        var sc = this;
        var root = document.getElementsByTagName( 'html' )[0]; // '0' to assign the first (and only `HTML` tag)
        root.removeAttribute('class');
        sc.filters = searchFactory.getAllFilters();
        sc.filters.primaryFilters = utilService.findAllByKeyAndValue(sc.filters.search, 'primary', true);
        var mortalityFilter = utilService.findByKeyAndValue(sc.filters.primaryFilters, 'key', 'deaths');
        sc.filters.selectedPrimaryFilter = utilService.findByKeyAndValue(sc.filters.primaryFilters, 'key', $stateParams.primaryFilterKey);
        sc.sideMenu = {visible: true};
        sc.downloadCSV = downloadCSV;
        sc.downloadXLS = downloadXLS;
        sc.getSelectedYears = getSelectedYears;
        sc.showPhaseTwoGraphs = showPhaseTwoGraphs;
        sc.showExpandedGraph = showExpandedGraph;
        sc.selectedMapSize='small';
        sc.showMeOptions = [
            {key:'number_of_deaths',title:'Number of Deaths'},
            {key:'crude_death_rates',title:'Crude Death Rates'},
            {key:'age-adjusted_death_rates',title:'Age Adjusted Death Rates'}
        ];
        sc.sort = ['year', 'gender', 'race', 'hispanicOrigin', 'agegroup', 'autopsy', 'placeofdeath', 'weekday', 'month', 'ucd-filters', 'mcd-filters'];
        sc.showFbDialog = showFbDialog;

        /*To render the inline bars for the sideBar filters*/
        searchFactory.addCountsToAutoCompleteOptions(mortalityFilter).then(function() {
            primaryFilterChanged(sc.filters.selectedPrimaryFilter);
        });

        $scope.$watch('sc.filters.selectedPrimaryFilter.key', function (newValue, oldValue) {
            if(newValue !== oldValue) {
                primaryFilterChanged(sc.filters.selectedPrimaryFilter);
            }
        }, true);

        function downloadCSV() {
            var data = getMixedTable(sc.filters.selectedPrimaryFilter);
            //add row headers so we can properly repeat row header merge cells
            data.rowHeaders = [];
            angular.forEach(sc.filters.selectedPrimaryFilter.value, function(filter, idx) {
                if(filter.groupBy === 'row') {
                    data.rowHeaders.push(filter);
                }
            });
            var filename = getFilename(sc.filters.selectedPrimaryFilter);
            xlsService.exportCSVFromMixedTable(data, filename);
        }

        function downloadXLS() {
            var data = getMixedTable(sc.filters.selectedPrimaryFilter);
            var filename = getFilename(sc.filters.selectedPrimaryFilter);
            xlsService.exportXLSFromMixedTable(data, filename);
        }

        function getMixedTable(selectedFilter){
            var file = selectedFilter.data;
            var headers = selectedFilter.headers;
            var countKey = selectedFilter.key;
            var countLabel = selectedFilter.countLabel;
            var totalCount = selectedFilter.count;
            var calculatePercentage = selectedFilter.calculatePercentage;
            var calculateRowTotal = selectedFilter.calculateRowTotal;

            //TODO: see comment in owh-table.component.js, we can construct this object once and pass it into the various components
            return utilService.prepareMixedTableData(headers, file, countKey, totalCount, countLabel, calculatePercentage, calculateRowTotal);
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

        function primaryFilterChanged(newFilter) {
            utilService.updateAllByKeyAndValue(sc.filters.search, 'initiated', false);
            sc.filters.selectedPrimaryFilter.searchResults(sc.filters.selectedPrimaryFilter).then(function() {
                sc.filters.selectedPrimaryFilter.initiated = true;
                if(sc.filters.selectedPrimaryFilter.key === 'deaths') {
                    updateStatesDeaths( sc.filters.selectedPrimaryFilter.maps, sc.filters.selectedPrimaryFilter.searchCount);
                }
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
