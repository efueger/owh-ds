//TODO: consolidate with search.service.js
//TODO: split out some logic into separate services
//TODO: split json out into separate files
(function(){
    angular
        .module('owh.search')
        .service('searchFactory', searchFactory);

    searchFactory.$inject = ["utilService", "SearchService", "$q", "$translate", "chartUtilService", '$rootScope', '$timeout', 'ModalService'];

    function searchFactory( utilService, SearchService, $q, $translate, chartUtilService, $rootScope, $timeout, ModalService ){
        var service = {
            getAllFilters : getAllFilters,
            queryMortalityAPI: queryMortalityAPI,
            addCountsToAutoCompleteOptions: addCountsToAutoCompleteOptions,
            searchMortalityResults: searchMortalityResults,
            showPhaseTwoModal: showPhaseTwoModal,
            uploadImage: uploadImage,
            updateFilterValues: updateFilterValues,
            generateHashCode: generateHashCode,
            buildAPIQuery: buildAPIQuery
        };
        return service;

        //Search for YRBS data
        function searchYRBSResults( primaryFilter ) {
            var deferred = $q.defer();
            queryYRBSAPI(primaryFilter).then(function(response){
                primaryFilter.data = response.data.table;
                //primaryFilter.chartData = response.chartData;
                primaryFilter.headers = response.headers;
                //primaryFilter.dataPrepared = true;
                deferred.resolve({});
            });
            return deferred.promise;
        }

        //Query YRBS API
        function queryYRBSAPI( primaryFilter ) {
            var deferred = $q.defer();
            var apiQuery = buildQueryForYRBS(primaryFilter);
            var headers = apiQuery.headers;
            SearchService.searchResults(primaryFilter).then(function(response) {
                /*var yearsFilter = utilService.findByKeyAndValue(primaryFilter.allFilters, 'key', 'year');
                if(!yearsFilter.autoCompleteOptions[0][primaryFilter.key]) {
                    var total = 0;
                    angular.forEach(response.data, function(eachYearData){
                        total += eachYearData.length;
                    });
                    primaryFilter.count = total;
                    angular.forEach(yearsFilter.autoCompleteOptions, function(eachYearOption){
                        eachYearOption[primaryFilter.key] = response.data[eachYearOption.key] ? response.data[eachYearOption.key].length : 0;
                        eachYearOption[primaryFilter.key + 'Percentage'] = Number(((eachYearOption[primaryFilter.key] / primaryFilter.count) * 100).toFixed(2));
                    });
                }*/
                /*var genderFilter = utilService.findByKeyAndValue(primaryFilter.allFilters, 'key', 'yrbsSex');
                var raceFilter = utilService.findByKeyAndValue(primaryFilter.allFilters, 'key', 'yrbsRace');
                var chartFilters = [genderFilter, raceFilter];
                var resultFilter = apiQuery.resultFilter;
                apiQuery.dataKeys = utilService.findAllNotContainsKeyAndValue(resultFilter.autoCompleteOptions, 'isAllOption', true);
                query.aggregations.nested.table = [];
                angular.forEach(chartFilters, function(eachFilter) {
                    var groupQuery = getGroupQuery(eachFilter);
                    groupQuery.isPrimary = eachFilter.key === resultFilter.key;
                    groupQuery.getCount = true;
                    query.aggregations.nested.table.push(groupQuery);
                    if(eachFilter.key !== resultFilter.key && eachFilter.key !== 'question') {
                        var allValues = utilService.findAllByKeyAndValue(eachFilter.autoCompleteOptions, 'isAllOption', true);
                        if(!query.query[eachFilter.queryKey] || allValues.indexOf(query.query[eachFilter.queryKey].value)) {
                            query.query[eachFilter.queryKey] = getFilterQuery(eachFilter);
                            query.query[eachFilter.queryKey].value = utilService.getValuesByKeyExcludingKeyAndValue(eachFilter.autoCompleteOptions, 'key', 'isAllOption', true);
                        }
                    }
                });
                query.query['question.key'] = response.data.maxQuestion;
                var chartDataFromAPI = {};
                var chartData = [];
                SearchService.searchResults(query).then(function(chartResponse) {
                    chartDataFromAPI = chartResponse.data.table;
                    chartData = [chartUtilService.horizontalStack(genderFilter, raceFilter, chartDataFromAPI, primaryFilter)];
                    deferred.resolve({
                        data: response.data,
                        chartData: [chartData],
                        headers : headers
                    });
                });*/
                //console.log(yearsFilter.autoCompleteOptions);
                /*var preparedData = utilService.prepareYRBSTableData(
                    response.data,
                    angular.copy(primaryFilter.additionalHeaders),
                    angular.copy(primaryFilter.value[0]),
                    angular.copy(yearsFilter)
                );*/

                /*var questionsFilter = utilService.findByKeyAndValue(primaryFilter.allFilters, 'key', 'question');
                if(!questionsFilter.autoCompleteOptions || questionsFilter.autoCompleteOptions.length === 0) {
                    questionsFilter.autoCompleteOptions = $rootScope.questionsList;
                }*/
                deferred.resolve({
                    data: response.data,
                    headers : headers
                });
            });
            return deferred.promise;
        }

        function updateFilterValues(primaryFilter) {
            angular.forEach(primaryFilter.sideFilters, function(filter) {
                var group =  (filter.filterGroup ? filter : filter.filters);
                if(group.filters) {
                    angular.forEach(group.filters, function(eachFilter) {
                        eachFilter.groupBy = group.groupBy;
                        addOrFilterToPrimaryFilterValue(eachFilter, primaryFilter);
                    });
                } else {
                    addOrFilterToPrimaryFilterValue(group, primaryFilter);
                }
            });
        }

        function addOrFilterToPrimaryFilterValue(filter, primaryFilter) {
            var filterIndex = utilService.findIndexByKeyAndValue(primaryFilter.value, 'key', filter.key);
            if(filter.groupBy && filterIndex < 0) {
                primaryFilter.value.push(filter);
            } else if(!filter.groupBy && filterIndex >= 0) {
                primaryFilter.value.splice(filterIndex, 1);
            }
        }

        function showChartForQuestion(primaryFilter, question) {
            var copiedPrimaryFilter = angular.copy(primaryFilter);
            var pieChartFilterKeys = ['yrbsGrade', 'yrbsRace'];
            var barChartFilterKeys = ['yrbsSex', 'yrbsRace'];
            var promises = [];
            var pieChartFilters = [];
            var barChartFilters = [];
            utilService.updateAllByKeyAndValue(copiedPrimaryFilter.allFilters, 'groupBy', false);
            var questionFilter = utilService.findByKeyAndValue(copiedPrimaryFilter.allFilters, 'key', 'question');
            questionFilter.value = [question];

            angular.forEach(pieChartFilterKeys, function(eachKey) {
                var eachChartPrimaryFilter = angular.copy(copiedPrimaryFilter);
                var eachFilter = utilService.findByKeyAndValue(eachChartPrimaryFilter.allFilters, 'key', eachKey);
                eachFilter.groupBy = 'column';
                eachFilter.getPercent = true;
                pieChartFilters.push(eachFilter);
                promises.push(SearchService.searchResults(eachChartPrimaryFilter));

            });
            var barChartPrimaryFilter = angular.copy(copiedPrimaryFilter);
            angular.forEach(barChartFilterKeys, function(eachKey) {
                var eachFilter = utilService.findByKeyAndValue(barChartPrimaryFilter.allFilters, 'key', eachKey);
                eachFilter.groupBy = 'column';
                eachFilter.getPercent = true;
                barChartFilters.push(eachFilter);
            });
            promises.push(SearchService.searchResults(barChartPrimaryFilter));
            $q.all(promises).then(function(values) {
                var chartData = [];
                angular.forEach(values.slice(0, 2), function(eachValue, index) {
                    chartData.push(chartUtilService.pieChart(eachValue.data.table[pieChartFilters[index].key], pieChartFilters[index], primaryFilter, '%'));
                });
                chartData.push(chartUtilService.horizontalStack(barChartFilters[0], barChartFilters[1], values[2].data.table, primaryFilter, '%'));
                var selectedQuestion = utilService.findByKeyAndValue(questionFilter.autoCompleteOptions, 'key', question);
                chartUtilService.showExpandedGraph(chartData, selectedQuestion.title);
            });
        }

        function searchMortalityResults(primaryFilter, queryID) {
            var deferred = $q.defer();
            queryMortalityAPI(primaryFilter, queryID).then(function(response){
                /*@TODO Our OWH application makes two backend call to display values in search page
                 one is for side filters and one request is to update right table and chart data
                 as combine two request into one, we are doing two request to elastsearch(at the backend) and in reponse returning required data
                 So we have move logic from searchFactory.addCountsToAutoCompleteOptions method (line 518 to 554) to here.
                */
               //@TODO: @Joe here I am getting sideFilters from ES 'response.sideFilterResults'
                primaryFilter.count = response.sideFilterResults.pagination.total;
                angular.forEach(response.sideFilterResults.data.simple, function(eachFilterData, key) {
                    //fill auto-completer data with counts
                    var filter = utilService.findByKeyAndValue(primaryFilter.allFilters, 'key', key);
                    if(filter) {
                        if(filter.autoCompleteOptions) {
                            angular.forEach(filter.autoCompleteOptions, function (option) {
                                var optionData = utilService.findByKeyAndValue(eachFilterData, 'name', option.key);
                                if (optionData) {
                                    option[primaryFilter.key] = optionData[primaryFilter.key];
                                    option['count'] = optionData[primaryFilter.key];
                                    option[primaryFilter.key + 'Percentage'] = 0;
                                    option[primaryFilter.key + 'Percentage'] = Number(((optionData[primaryFilter.key] / primaryFilter.count) * 100).toFixed(2));
                                } else {
                                    option[primaryFilter.key] = 0;
                                    option['count'] = 0;
                                    option[primaryFilter.key + 'Percentage'] = 0;
                                }
                            });
                        } else {
                            var autoCompleteOptions = [];
                            angular.forEach(eachFilterData, function(eachData) {
                                var eachOption = {  key: eachData.name, title: eachData.name };
                                eachOption[primaryFilter.key] = eachData[primaryFilter.key];
                                eachOption['count'] = eachData[primaryFilter.key];
                                eachOption[primaryFilter.key + 'Percentage'] = Number(((eachData[primaryFilter.key] / primaryFilter.count) * 100).toFixed(2));
                                autoCompleteOptions.push(eachOption);
                            });
                            filter.autoCompleteOptions = autoCompleteOptions;
                        }
                        //sort on primary filter key.. so that it will rendered in desc order in side filter
                        //filter.sortedAutoCompleteOptions = utilService.sortByKey(angular.copy(filter.autoCompleteOptions), 'count', false);
                    }
                });
                var ucd10Filter = utilService.findByKeyAndValue(primaryFilter.allFilters, 'key', 'ucd-chapter-10');
                ucd10Filter.autoCompleteOptions = $rootScope.conditionsListICD10;

                primaryFilter.data = response.data;
                primaryFilter.headers = response.headers;
                primaryFilter.calculatePercentage = true;
                primaryFilter.calculateRowTotal = true;
                primaryFilter.chartDataFromAPI = response.chartDataFromAPI;
                primaryFilter.chartData = response.chartData;
                primaryFilter.dataPrepared = response.dataPrepared;
                primaryFilter.maps = response.maps;
                primaryFilter.searchCount = response.totalCount;
                deferred.resolve(response);
            });
            return deferred.promise;
        }

        function generateHashCode(primaryFilter) {
            var deferred = $q.defer();
            var apiQuery = buildAPIQuery(primaryFilter);
            var query = apiQuery.apiQuery;
            SearchService.generateHashCode(query).then(function(response) {
                console.log(" search factory generatehashcode ", response.data);
                deferred.resolve(response.data);
            });
            return deferred.promise;
        }

       /* function getResults(primaryFilter) {
            var deferred = $q.defer();
            var apiQuery = buildAPIQuery(primaryFilter);
            var headers = apiQuery.headers;
            SearchService.getResults(apiQuery.apiQuery).then(function(response){
                console.log(" in search factory..... after service getResults call");
                deferred.resolve({
                    data : "",
                    dataPrepared : false,
                    headers : headers,
                    chartDataFromAPI : "",
                    chartData: "",
                    maps: "",
                    totalCount: ""
                });
            });
            return deferred.promise;
        }

        function generateHashFromQueryJson(queryJson) {
            var deferred = $q.defer();
            var apiQuery = buildAPIQuery(queryJson);
            //var headers = apiQuery.headers;
            return SearchService.generateHashCode(apiQuery.apiQuery.query);
        }*/

        //search results by grouping
        function queryMortalityAPI( primaryFilter, queryID) {
            var deferred = $q.defer();
            //@TODO we are bulding api query at server side, but still using this method to build headers
            var apiQuery = buildAPIQuery(primaryFilter);
            var headers = apiQuery.headers;
            //var query = apiQuery.apiQuery;
            //Passing completed primaryFilters to backend and building query at server side
            SearchService.searchResults(primaryFilter, queryID).then(function(response) {
                //resolve data for controller
                deferred.resolve({
                    data : response.data.resultData.nested.table,
                    dataPrepared : false,
                    headers : headers,
                    chartDataFromAPI : response.data.resultData.simple,
                    chartData: prepareChartData(headers, response.data.resultData.nested, primaryFilter),
                    maps: response.data.resultData.nested.maps,
                    totalCount: response.pagination.total,
                    sideFilterResults: response.data.sideFilterResults,
                    queryJSON: response.data.queryJSON
                });
            });
            return deferred.promise;
        }

        function prepareChartData(headers, nestedData, primaryFilter) {
            var chartData = [];

            if(primaryFilter.showMap) {
                chartData.push(primaryFilter.mapData);
            }
            //When user selects more than one filter
            if( headers.chartHeaders.length > 0 ) {
                angular.forEach(headers.chartHeaders, function(eachChartHeaders, index) {
                    chartData.push(chartUtilService[eachChartHeaders.chartType](eachChartHeaders.headers[0], eachChartHeaders.headers[1],
                        nestedData.charts[index], primaryFilter));
                });
            }else if( ( headers.rowHeaders.length + headers.columnHeaders.length ) === 1 ) {
                var data = nestedData.table;
                var header = (headers.rowHeaders.length === 1) ? headers.rowHeaders[0] : headers.columnHeaders[0];
                var pieData = data[header.key];
                chartData.push(chartUtilService.pieChart(pieData,header,primaryFilter));
            }

            //prepare charts data to render three charts in a row
            var eachArr = [],chartDataArr=[];
            if(chartData.length>3) {
                angular.forEach(chartData,function(value, index){
                    if((index+1) % 3 === 0 ) {
                        eachArr.push(value);
                        chartDataArr.push(eachArr);
                        eachArr=[];
                    }else if(chartData.length === index+1){
                        eachArr.push(value);
                        chartDataArr.push(eachArr);
                    }else{
                        eachArr.push(value);
                    }
                });
            }else{
                angular.forEach(chartData,function(value, index){
                    eachArr.push(value);
                });
                chartDataArr.push(eachArr);
            }
            return chartDataArr;
        }

        function prepareChartAggregations(headers) {
            var chartHeaders = [];
            var chartAggregations = [];
            angular.forEach(headers, function(eachPrimaryHeader) {
                var primaryGroupQuery = getGroupQuery(eachPrimaryHeader);
                angular.forEach(headers, function(eachSecondaryHeader) {
                    var chartType = $rootScope.chartMappings[eachPrimaryHeader.key + '&' + eachSecondaryHeader.key];
                    if(chartType) {
                        var secondaryGroupQuery = getGroupQuery(eachSecondaryHeader);
                        chartHeaders.push({headers: [eachPrimaryHeader, eachSecondaryHeader], chartType: chartType});
                        chartAggregations.push([primaryGroupQuery, secondaryGroupQuery]);
                    }
                });
            });
            return {
                chartHeaders: chartHeaders,
                chartAggregations: chartAggregations
            }
        }


        function prepareMapAggregations() {
            var chartAggregations = [];
            var primaryGroupQuery = {
                key: "states",
                queryKey: "state",
                size: 100000
            };
            var secondaryGroupQuery = {
                key: "sex",
                queryKey: "sex",
                size: 100000
            };
            chartAggregations.push([primaryGroupQuery, secondaryGroupQuery]);
            return chartAggregations;
        }

        //build grouping query for api
        function buildAPIQuery(primaryFilter) {
            var apiQuery = {
                searchFor: primaryFilter.key,
                countQueryKey: primaryFilter.countQueryKey,
                query: {},
                aggregations: {
                    simple: [],
                    nested: {
                        table: [],
                        charts: [],
                        maps:[]
                    }
                }
            };
            //var defaultAggregations = [];
            var rowAggregations = [];
            var columnAggregations = [];
            var headers = {
                rowHeaders: [],
                columnHeaders: [],
                chartHeaders: []
            };
            //var defaultHeaders = [];
            var sortedFilters = utilService.sortByKey(angular.copy(primaryFilter.allFilters), getAutoCompleteOptionsLength);
            angular.forEach(sortedFilters, function(eachFilter) {
                if(eachFilter.groupBy) {
                    var eachGroupQuery = getGroupQuery(eachFilter);
                    if ( eachFilter.groupBy === 'row' ) {
                        //user defined aggregations for rendering table
                        rowAggregations.push(eachGroupQuery);
                        headers.rowHeaders.push(eachFilter);
                    } else if( eachFilter.groupBy === 'column' ) {
                        columnAggregations.push(eachGroupQuery);
                        headers.columnHeaders.push(eachFilter);
                    }
                }
                var eachFilterQuery = buildFilterQuery(eachFilter);
                if(eachFilterQuery) {
                    apiQuery.query[eachFilter.queryKey] = eachFilterQuery;
                }
            });
            apiQuery.aggregations.nested.table = rowAggregations.concat(columnAggregations);
            var result = prepareChartAggregations(headers.rowHeaders.concat(headers.columnHeaders));
            headers.chartHeaders = result.chartHeaders;
            apiQuery.aggregations.nested.charts = result.chartAggregations;
            apiQuery.aggregations.nested.maps = prepareMapAggregations();
            //apiQuery.aggregations.nested = apiQuery.aggregations.nested.concat(defaultAggregations);
            //headers = headers.concat(defaultHeaders);
            return {
                apiQuery: apiQuery,
                headers: headers
            };
        }

        function getGroupQuery(filter/*, isPrimary*/) {
            var groupQuery = {
                key: filter.key,
                queryKey: filter.aggregationKey ? filter.aggregationKey : filter.queryKey,
                getPercent: filter.getPercent,
                size: 100000
            };/*
            if(isPrimary) {
                groupQuery.isPrimary = true;
            }*/
            return groupQuery;
        }

        function buildFilterQuery(filter) {
            if( utilService.isValueNotEmpty(filter.value) && filter.value.length !== getAutoCompleteOptionsLength(filter)) {
                return getFilterQuery(filter);
            }
            return false;
        }

        function getFilterQuery(filter) {
            var values = [];
            return {
                key: filter.key,
                queryKey: filter.queryKey,
                value: filter.value,
                primary: filter.primary
            };
        }

        function getAutoCompleteOptionsLength(filter) {
            return filter.autoCompleteOptions ? filter.autoCompleteOptions.length : 0;
        }

        function buildQueryForYRBS(primaryFilter, dontAddYearAgg) {
            var result = buildAPIQuery(primaryFilter);
            var apiQuery = result.apiQuery;
            var headers = result.headers;
            var resultFilter = headers.columnHeaders.length > 0 ? headers.columnHeaders[0] : headers.rowHeaders[0];
            var resultAggregation = utilService.findByKeyAndValue(apiQuery.aggregations.nested.table, 'key', resultFilter.key);
            resultAggregation.isPrimary = true;
            apiQuery.dataKeys = utilService.findAllNotContainsKeyAndValue(resultFilter.autoCompleteOptions, 'isAllOption', true);
            angular.forEach(headers.columnHeaders.concat(headers.rowHeaders), function(eachFilter) {
                var allValues = utilService.getValuesByKeyIncludingKeyAndValue(eachFilter.autoCompleteOptions, 'key', 'isAllOption', true);
                if(eachFilter.key === resultFilter.key) {
                    if(apiQuery.query[eachFilter.queryKey]) {
                        apiQuery.query[eachFilter.queryKey].value = allValues;
                    }
                } else if(eachFilter.key !== resultFilter.key && eachFilter.key !== 'question') {
                    if(!apiQuery.query[eachFilter.queryKey] || allValues.indexOf(apiQuery.query[eachFilter.queryKey].value) >= 0) {
                        apiQuery.query[eachFilter.queryKey] = getFilterQuery(eachFilter);
                        apiQuery.query[eachFilter.queryKey].value = utilService.getValuesByKeyExcludingKeyAndValue(eachFilter.autoCompleteOptions, 'key', 'isAllOption', true);
                    }
                }
            });
            apiQuery.query.primary_filter = getFilterQuery({key: 'primary_filter', queryKey: 'primary_filter', value: resultFilter.queryKey, primary: false});
            var yearFilter = utilService.findByKeyAndValue(primaryFilter.allFilters, 'key', 'year');
            if(yearFilter.value.length != 1 && !dontAddYearAgg) {
                headers.columnHeaders.push(yearFilter);
                apiQuery.aggregations.nested.table.push(getGroupQuery(yearFilter));
            }
            result.resultFilter = resultFilter;
            return result;
        }

        function addCountsToAutoCompleteOptions(primaryFilter, query, queryID) {
            var deferred = $q.defer();
            var apiQuery = {
                searchFor: primaryFilter.key,
                aggregations: { simple: [] }
            };
            var filters = [];
            angular.forEach(primaryFilter.sideFilters, function(eachSideFilter) {
                filters = filters.concat(eachSideFilter.filterGroup ? eachSideFilter.filters : [eachSideFilter.filters]);
            });
            angular.forEach(filters, function(eachFilter) {
                apiQuery.aggregations.simple.push(getGroupQuery(eachFilter));
            });
            if(query) {
                var filterQuery = buildAPIQuery(query).apiQuery.query;
                apiQuery.query = filterQuery;
            }
            //search results and populate according owh design
            SearchService.searchResults(apiQuery, queryID).then(function(response) {
                primaryFilter.count = response.pagination.total;
                angular.forEach(response.data.simple, function(eachFilterData, key) {
                    //fill auto-completer data with counts
                    var filter = utilService.findByKeyAndValue(primaryFilter.allFilters, 'key', key);
                    if(filter) {
                        if(filter.autoCompleteOptions) {
                            angular.forEach(filter.autoCompleteOptions, function (option) {
                                var optionData = utilService.findByKeyAndValue(eachFilterData, 'name', option.key);
                                if (optionData) {
                                    option[primaryFilter.key] = utilService.numberWithCommas(optionData[primaryFilter.key]);
                                    option['count'] = optionData[primaryFilter.key];
                                    option[primaryFilter.key + 'Percentage'] = 0;
                                    option[primaryFilter.key + 'Percentage'] = Number(((optionData[primaryFilter.key] / primaryFilter.count) * 100).toFixed(2));
                                } else {
                                    option[primaryFilter.key] = 0;
                                    option['count'] = 0;
                                    option[primaryFilter.key + 'Percentage'] = 0;
                                }
                            });
                        } else {
                            var autoCompleteOptions = [];
                            angular.forEach(eachFilterData, function(eachData) {
                                var eachOption = {  key: eachData.name, title: eachData.name };
                                eachOption[primaryFilter.key] = utilService.numberWithCommas(eachData[primaryFilter.key]);
                                eachOption['count'] = eachData[primaryFilter.key];
                                eachOption[primaryFilter.key + 'Percentage'] = Number(((eachData[primaryFilter.key] / primaryFilter.count) * 100).toFixed(2));
                                autoCompleteOptions.push(eachOption);
                            });
                            filter.autoCompleteOptions = autoCompleteOptions;
                        }
                        //sort on primary filter key.. so that it will rendered in desc order in side filter
                        //filter.sortedAutoCompleteOptions = utilService.sortByKey(angular.copy(filter.autoCompleteOptions), 'count', false);
                    }
                });
                var ucd10Filter = utilService.findByKeyAndValue(primaryFilter.allFilters, 'key', 'ucd-chapter-10');
                ucd10Filter.autoCompleteOptions = $rootScope.conditionsListICD10;
                deferred.resolve({});
            });
            return deferred.promise;
        }

        function buildQueryForBridgeRacePopulation(primaryFilter) {
            var result = buildAPIQuery(primaryFilter);
            var apiQuery = result.apiQuery;
            var headers = result.headers;
            var resultFilter = headers.columnHeaders.length > 0 ? headers.columnHeaders[0] : headers.rowHeaders[0];
            var resultAggregation = utilService.findByKeyAndValue(apiQuery.aggregations.nested.table, 'key', resultFilter.key);
            resultAggregation.isPrimary = true;
            apiQuery.dataKeys = utilService.findAllNotContainsKeyAndValue(resultFilter.autoCompleteOptions, 'isAllOption', true);
            angular.forEach(headers.columnHeaders.concat(headers.rowHeaders), function(eachFilter) {
                var allValues = utilService.getValuesByKeyIncludingKeyAndValue(eachFilter.autoCompleteOptions, 'key', 'isAllOption', true);
                if(eachFilter.key === resultFilter.key) {
                    if(apiQuery.query[eachFilter.queryKey]) {
                        apiQuery.query[eachFilter.queryKey].value = allValues;
                    }
                } else {
                    if(!apiQuery.query[eachFilter.queryKey] || allValues.indexOf(apiQuery.query[eachFilter.queryKey].value) >= 0) {
                        apiQuery.query[eachFilter.queryKey] = getFilterQuery(eachFilter);
                        apiQuery.query[eachFilter.queryKey].value = utilService.getValuesByKeyExcludingKeyAndValue(eachFilter.autoCompleteOptions, 'key', 'isAllOption', true);
                    }
                }
            });

            var yearFilter = utilService.findByKeyAndValue(primaryFilter.allFilters, 'key', 'current_year');

            if(yearFilter.value.length != 1) {
                headers.columnHeaders.push(yearFilter);
                apiQuery.aggregations.nested.table.push(getGroupQuery(yearFilter));
            }
            result.resultFilter = resultFilter;
            return result;
        }

        function queryCensusAPI( primaryFilter ) {

            var deferred = $q.defer();
            var apiQuery = buildQueryForBridgeRacePopulation(primaryFilter);
            var headers = apiQuery.headers;

            SearchService.searchResults(primaryFilter).then(function(response) {
                deferred.resolve({
                    data : response.data.nested.table,
                    headers : headers,
                    totalCount: response.pagination.total
                });
            });
            return deferred.promise;
        }

        /**
         * Search census bridge race population estmation
         */
        function searchCensusInfo(primaryFilter) {
            var deferred = $q.defer();

            console.log(primaryFilter);

            queryCensusAPI(primaryFilter).then(function(response){
                primaryFilter.data = response.data;
                primaryFilter.headers = response.headers;
                deferred.resolve({});
            });

            return deferred.promise;
        }

        function getAllFilters() {
            //TODO: consider making these available as angular values, split out into separate file
            var filters = {};
            filters.groupOptions = [
                {key:'column',title:'Column', tooltip:'Select to view as columns on data table'},
                {key:'row',title:'Row', tooltip:'Select to view as rows on data table'},
                {key: false,title:'Off', tooltip:'Select to hide on data table'}
            ];
            filters.conditionGroupOptions = [
                {key:'row',title:'Row', tooltip:'Select to view as rows on data table'},
                {key: false,title:'Off', tooltip:'Select to hide on data table'}
            ];
            filters.columnGroupOptions = [
                {key:'column',title:'Column', tooltip:'Select to view as columns on data table'},
                {key: false,title:'Off', tooltip:'Select to hide on data table'}
            ];
            filters.inlineChartingOptions = [
                {key: true,title:'On', tooltip:'Select to view inline charts'},
                {key: false,title:'Off', tooltip:'Select to hide inline charts'}
            ];
            filters.allowInlineCharting = false;
            filters.races = [
                {key: '3',title: 'American Indian'},
                {key: '4',title: 'Asian or Pacific Islander'},
                {key: '2',title: 'Black'},
                {key: '0',title: 'Other (Puerto Rico only)'},
                {key: '1',title: 'White'}
            ];

            filters.hispanicOptions = [
                {"key":"221-230","title":"Central American"},
                {"key":"220","title":"Central and South American"},
                {"key":"270-274","title":"Cuban"},
                {"key":"275-279","title":"Dominican"},
                {"key":"250-259","title":"Latin American"},
                {"key":"210-219","title":"Mexican"},
                {"key":"100-199","title":"Non-Hispanic"},
                {"key":"280-299","title":"Other Hispanic"},
                {"key":"260-269","title":"Puerto Rican"},
                {"key":"231-249","title":"South American"},
                {"key":"200-209","title":"Spaniard"},
                {"key":"996-999","title":"Unknown"}
            ];

            filters.weekday = [
                {key: '1', title: 'Sunday'},
                {key: '2', title: 'Monday'},
                {key: '3', title: 'Tuesday'},
                {key: '4', title: 'Wednesday'},
                {key: '5', title: 'Thursday'},
                {key: '6', title: 'Friday'},
                {key: '7', title: 'Saturday'},
                {key: '9', title: 'Unknown'}
            ];

            filters.autopsy = [
                {key: 'Y', title: 'Yes'},
                {key: 'N', title: 'No'},
                {key: 'U', title: 'Unknown'}
            ];

            filters.podOptions = [
                {key:'4',title:'Decedent’s home'},
                {key:'5',title:'Hospice facility'},
                {key:'3',title:'Hospital, Clinic or Medical Center-  Dead on Arrival'},
                {key:'1',title:'Hospital, clinic or Medical Center-  Inpatient'},
                {key:'2',title:'Hospital, Clinic or Medical Center-  Outpatient or admitted to Emergency Room'},
                {key:'6',title:'Nursing home/long term care'},
                {key:'9',title:'Place of death unknown'},
                {key:'7',title:'Other'}
            ];

            filters.maritalStatuses = [
                {key:'M',title:'Married'},
                {key:'S',title:'Never married, single'},
                {key:'W',title:'Widowed'},
                {key:'D',title:'Divorced'},
                {key:'U',title:'Marital Status unknown'}
            ];

            filters.ageOptions = [
                {key:'01-06',title:'0 -  4 years', min: 1, max: 5},
                {key:'07-07',title:'5 -  9 years', min: 6, max: 10},
                {key:'08-08',title:'10 -  14 years', min: 11, max: 15},
                {key:'09-09',title:'15 - 19 years', min: 16, max: 20},
                {key:'10-10',title:'20 - 24 years', min: 21, max: 25},
                {key:'11-11',title:'25 - 29 years', min: 26, max: 30},
                {key:'12-12',title:'30 - 34 years', min: 31, max: 35},
                {key:'13-13',title:'35 - 39 years', min: 36, max: 40},
                {key:'14-14',title:'40 - 44 years', min: 41, max: 45},
                {key:'15-15',title:'45 - 49 years', min: 46, max: 50},
                {key:'16-16',title:'50 - 54 years', min: 51, max: 55},
                {key:'17-17',title:'55 - 59 years', min: 56, max: 60},
                {key:'18-18',title:'60 - 64 years', min: 61, max: 65},
                {key:'19-19',title:'65 - 69 years', min: 66, max: 70},
                {key:'20-20',title:'70 - 74 years', min: 71, max: 75},
                {key:'21-21',title:'75 - 79 years', min: 76, max: 80},
                {key:'22-22',title:'80 - 84 years', min: 81, max: 85},
                {key:'23-23',title:'85 - 89 years', min: 86, max: 90},
                {key:'24-24',title:'90 - 94 years', min: 91, max: 95},
                {key:'25-25',title:'95 - 99 years', min: 96, max: 100},
                {key:'26-26',title:'>100', min: 101, max: 105},
                {key:'27-27',title:'Age not stated', min: -5, max: 0}
            ];

            filters.genderOptions=[
                {key:'F',title:'Female'},
                {key:'M',title:'Male'}
            ];

            filters.yearOptions = [];

            filters.modOptions = [
                {key:'01',title:'January'},
                {key:'02',title:'February'},
                {key:'03',title:'March'},
                {key:'04',title:'April'},
                {key:'05',title:'May'},
                {key:'06',title:'June'},
                {key:'07',title:'July'},
                {key:'08',title:'August'},
                {key:'09',title:'September'},
                {key:'10',title:'October'},
                {key:'11',title:'November'},
                {key:'12',title:'December'}
            ];

            filters.ageSliderOptions = {
                from: -5,
                to: 105,
                step: 5,
                threshold: 0,
                scale: ['Not stated', 0, '', 10, '', 20, '', 30, '', 40, '', 50, '', 60, '', 70, '', 80, '', 90, '', 100, '>100'],
                modelLabels: {'-5': 'Not stated', 105: '>100'},
                css: {
                    background: {'background-color': '#ccc'},
                    before: {'background-color': '#ccc'},
                    default: {'background-color': 'white'},
                    after: {'background-color': '#ccc'},
                    pointer: {'background-color': '#914fb5'},
                    range: {"background-color": "#914fb5"}
                },
                onstatechange: function(value) {
                    var values = value.split(';');
                    var minValue = Number(values[0]);
                    var maxValue = Number(values[1]);
                    var agegroupFilter = utilService.findByKeyAndValue(filters.allMortalityFilters, 'key', 'agegroup');
                    var prevValue = angular.copy(agegroupFilter.value);
                    agegroupFilter.value = [];
                    angular.forEach(agegroupFilter.autoCompleteOptions, function(eachOption) {
                        if((eachOption.min <= minValue && eachOption.max >= minValue)
                            || (eachOption.min >= minValue && eachOption.max <= maxValue)
                            || (eachOption.min <= maxValue && eachOption.max >= maxValue)) {
                            agegroupFilter.value.push(eachOption.key);
                        }
                    });
                    if(!agegroupFilter.timer && !angular.equals(prevValue, agegroupFilter.value) && filters.selectedPrimaryFilter.initiated) {
                        agegroupFilter.timer = $timeout(function(){
                            agegroupFilter.timer=undefined;
                            filters.selectedPrimaryFilter.searchResults(filters.selectedPrimaryFilter);
                        }, 2000);
                    }
                }
            };

            filters.yrbsGenderOptions =  [
                { "key": "female", "title": "Female" },
                { "key": "male", "title": "Male" }
            ];

            filters.yrbsRaceOptions =  [
                { "key": "ai_an", "title": "American Indian or Alaska Native" },
                { "key": "asian", "title": "Asian" },
                { "key": "black_african_american", "title": "Black or African American" },
                { "key": "hispanic", "title": "Hispanic or Latino" },
                { "key": "nhopi", "title": "Native Hawaiian or Other Pacific Islander" },
                { "key": "white", "title": "White" },
                { "key": "multiple_race", "title": "Multiple Race" }
            ];

            filters.yrbsGradeOptions = [
                { "key": "9th", "title": "9th" },
                { "key": "10th", "title": "10th" },
                { "key": "11th", "title": "11th" },
                { "key": "12th", "title": "12th" }
            ];

            filters.yrbsYearsOptions = [
                { "key": "2015", "title": "2015" },
                { "key": "2013", "title": "2013" },
                { "key": "2011", "title": "2011" },
                { "key": "2009", "title": "2009" }
            ];

            filters.yrbsAdditionalHeaders = [
                { "key": "question", "title": "Question" },
                { "key": "count", "title": "Total" }
            ];

            filters.yrbsFilters = [
                {key: 'year', title: 'label.yrbs.filter.year', queryKey:"year",primary: false, value: ['2015'], groupBy: false,
                   autoCompleteOptions: angular.copy(filters.yrbsYearsOptions), donotshowOnSearch:true },
                { key: 'yrbsSex', title: 'label.yrbs.filter.sex', queryKey:"sex", primary: false, value: [], groupBy: false,
                    autoCompleteOptions: angular.copy(filters.yrbsGenderOptions), defaultGroup:"column" },
                { key: 'yrbsGrade', title: 'label.yrbs.filter.grade', queryKey:"grade", primary: false, value: [], groupBy: false,
                     autoCompleteOptions: angular.copy(filters.yrbsGradeOptions), defaultGroup:"column" },
                { key: 'yrbsRace', title: 'label.yrbs.filter.race', queryKey:"race", primary: false, value: [], groupBy: 'column',
                   autoCompleteOptions: angular.copy(filters.yrbsRaceOptions), defaultGroup:"column" },
                { key: 'question', title: 'label.yrbs.filter.question', queryKey:"question.path", aggregationKey:"question.key", primary: false, value: [], groupBy: 'row',
                    filterType: 'tree', autoCompleteOptions: $rootScope.questionsList, donotshowOnSearch:true,
                    selectTitle: 'select.label.yrbs.filter.question', iconClass: 'fa fa-pie-chart purple-text', onIconClick: function(question) {
                        showChartForQuestion(filters.selectedPrimaryFilter, question);
                    }
                }
            ];

            filters.cencusYearsOptions = [
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

            filters.censuGenderOptions =  [
                { "key": "Female", "title": "Female" },
                { "key": "Male", "title": "Male" }
            ];

            filters.censusRaceOptions =  [
                { "key": "White", "title": "White" },
                { "key": "Black or African American", "title": "Black or African American" },
                { "key": "American Indian", "title": "American Indian" },
                { "key": "Asian or Pacific Islander", "title": "Asian or Pacific Islander" }
            ];

            filters.censusHispanicOriginOptions =  [
                { "key": "1", "title": "not Hispanic or Latino" },
                { "key": "2", "title": "Hispanic or Latino" }
            ];

            filters.censusStateOptions =  [
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

            filters.censucAgeOptions = [
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

            filters.censusFilters = [
                {key: 'state', title: 'label.filter.state', queryKey:"state",primary: false, value:[], defaultGroup:'row', groupBy: false,
                    autoCompleteOptions: angular.copy(filters.censusStateOptions), value:[]},
                {key: 'age', title: 'label.filter.age', queryKey:"age",primary: false, value:[], defaultGroup:'row', groupBy: false,
                    autoCompleteOptions: angular.copy(filters.censucAgeOptions), value:[]},
                {key: 'race', title: 'label.filter.race', queryKey:"race",primary: false, defaultGroup:'column', groupBy: 'row',
                    autoCompleteOptions: angular.copy(filters.censusRaceOptions), value:[]},
                {key: 'ethnicity', title: 'label.filter.hispanicOrigin', queryKey:"hispanic_origin",primary: false, defaultGroup:'row', groupBy: false,
                    autoCompleteOptions: angular.copy(filters.censusHispanicOriginOptions), value:[]},
                {key: 'current_year', title: 'label.filter.yearly.estimate', queryKey:"current_year", primary: false, value: ['2000'], defaultGroup:'row', groupBy: false,
                    autoCompleteOptions: angular.copy(filters.cencusYearsOptions) },
                {key: 'sex', title: 'label.filter.gender', queryKey:"sex", primary: false, value: [], defaultGroup:'column', groupBy: 'column',
                    autoCompleteOptions: angular.copy(filters.censuGenderOptions)}
            ];

            filters.allMortalityFilters = [
                /*Demographics*/
                {key: 'agegroup', title: 'label.filter.agegroup', queryKey:"age_5_interval",
                    primary: false, value: [], groupBy: false, type:"label.filter.group.demographics",
                    filterType: 'slider', autoCompleteOptions: angular.copy(filters.ageOptions), showChart: true,
                    sliderOptions: filters.ageSliderOptions, sliderValue: '-5;105', timer: undefined, defaultGroup:"row"},
                {key: 'hispanicOrigin', title: 'label.filter.hispanicOrigin', queryKey:"hispanic_origin",
                    primary: false, value: [], groupBy: false, type:"label.filter.group.demographics",
                    autoCompleteOptions: angular.copy(filters.hispanicOptions), defaultGroup:"row"},
                {key: 'race', title: 'label.filter.race', queryKey:"race", primary: false, value: [], groupBy: 'row',
                    type:"label.filter.group.demographics", showChart: true, defaultGroup:"column",
                    autoCompleteOptions: angular.copy(filters.races)},
                {key: 'gender', title: 'label.filter.gender', queryKey:"sex", primary: false, value: [], groupBy: 'column',
                    type:"label.filter.group.demographics", groupByDefault: 'column', showChart: true,
                    autoCompleteOptions: angular.copy(filters.genderOptions), defaultGroup:"column"},


                /*Year and Month*/
                //TODO: consider setting default selected years elsewhere
                {key: 'year', title: 'label.filter.year', queryKey:"current_year",primary: false, value: [],
                    groupBy: false,type:"label.filter.group.year.month", defaultGroup:"row"},
                {key: 'month', title: 'label.filter.month', queryKey:"month_of_death", primary: false, value: [],
                    groupBy: false,type:"label.filter.group.year.month", defaultGroup:"row",
                    autoCompleteOptions: angular.copy(filters.modOptions)},


                /*Weekday, Autopsy, Place of Death */
                {key: 'weekday', title: 'label.filter.weekday', queryKey:"week_of_death",
                    primary: false, value: [], groupBy: false,type:"label.filter.group.weekday.autopsy.pod",
                    autoCompleteOptions: angular.copy(filters.weekday), defaultGroup:"row"},
                {key: 'autopsy', title: 'label.filter.autopsy', queryKey:"autopsy",
                    primary: false, value: [], groupBy: false,type:"label.filter.group.weekday.autopsy.pod",
                    autoCompleteOptions: angular.copy(filters.autopsy), defaultGroup:"row"},
                {key: 'placeofdeath', title: 'label.filter.pod', queryKey:"place_of_death",
                    primary: false, value: [], groupBy: false,type:"label.filter.group.weekday.autopsy.pod",
                    autoCompleteOptions: angular.copy(filters.podOptions), defaultGroup:"row"},

                /*Underlying Cause of Death*/
                {key: 'ucd-chapter-10', title: 'label.filter.ucd.icd.chapter', queryKey:"ICD_10_code.path",
                    primary: true, value: [], groupBy: false,type:"label.filter.group.ucd", groupKey:"ucd",
                    autoCompleteOptions: $rootScope.conditionsListICD10,
                    aggregationKey:"ICD_10_code.code"},
                {key: 'ucd-icd-10-113', title: 'label.filter.icd10.113', queryKey:"ICD_113_code",
                    primary: false, value: [], groupBy: false,type:"label.filter.group.ucd", groupKey:"ucd",
                    autoCompleteOptions: $rootScope.conditionsListICD10113, disableFilter: true},
                {key: 'ucd-icd-10-130', title: 'label.filter.icd10.130', queryKey:"ICD_130_code",
                    primary: false, value: [], groupBy: false,type:"label.filter.group.ucd", groupKey:"ucd",
                    autoCompleteOptions: $rootScope.conditionsListICD10130, disableFilter: true},

                /*Multiple Cause of death*/
                {key: 'mcd-chapter-10', title: 'label.filter.mcd.icd.chapter', queryKey:"record_axis_condn",
                    primary: false, value: [], groupBy: false,type:"label.filter.group.mcd", groupKey:"mcd",
                    autoCompleteOptions: $rootScope.conditionsListICD10, disableFilter: true},
                {key: 'mcd-icd-10-113', title: 'label.filter.mcd.cause.list', queryKey:"record_axis_condn",
                    primary: false, value: [], groupBy: false,type:"label.filter.group.mcd", groupKey:"mcd",
                    autoCompleteOptions: $rootScope.conditionsListICD10113, disableFilter: true},
                {key: 'mcd-icd-10-130', title: 'label.filter.mcd.cause.list.infant', queryKey:"record_axis_condn",
                    primary: false, value: [], groupBy: false,type:"label.filter.group.mcd", groupKey:"mcd",
                    autoCompleteOptions: $rootScope.conditionsListICD10130, disableFilter: true}
            ];

            filters.ucdMcdFilters = [
                {key: 'ucd-filters', title: 'label.filter.ucd', queryKey:"",
                    primary: false, value: [], groupBy: false,type:"label.filter.group.ucd",
                    filterType: 'conditions', groupOptions: filters.conditionGroupOptions,
                    autoCompleteOptions: utilService.findAllByKeyAndValue(filters.allMortalityFilters, 'key', 'ucd-chapter-10')},
                {key: 'mcd-filters', title: 'label.filter.mcd', queryKey:"",
                    primary: false, value: [], groupBy: false,type:"label.filter.group.mcd",
                    filterType: 'conditions', groupOptions: [],
                    autoCompleteOptions: utilService.findAllByKeyAndValue(filters.allMortalityFilters, 'key', 'mcd-chapter-10')}
            ];

            filters.search = [
                {
                    key: 'deaths', title: 'label.filter.mortality', primary: true, value: [], header:"Mortality",
                    allFilters: filters.allMortalityFilters, searchResults: searchMortalityResults, showMap:true,
                    countLabel: 'Number of Deaths', mapData:{},
                    sideFilters:[
                        {
                            filterGroup: false, collapse: false, allowGrouping: true,
                            filters: utilService.findByKeyAndValue(filters.allMortalityFilters, 'key', 'year')
                        },
                        {
                            filterGroup: false, collapse: true, allowGrouping: true,
                            filters: utilService.findByKeyAndValue(filters.allMortalityFilters, 'key', 'race')
                        },
                        {
                            filterGroup: false, collapse: true, allowGrouping: true,
                            filters: utilService.findByKeyAndValue(filters.allMortalityFilters, 'key', 'gender')
                        },
                        {
                            filterGroup: false, collapse: true,allowGrouping: true,
                            filters: utilService.findByKeyAndValue(filters.allMortalityFilters, 'key', 'agegroup')
                        },
                        {
                            filterGroup: false, collapse: true, allowGrouping: true, groupBy: false,
                            filters: utilService.findByKeyAndValue(filters.allMortalityFilters, 'key', 'hispanicOrigin')
                        },
                        {
                            filterGroup: false, collapse: true, allowGrouping: true,
                            filters: utilService.findByKeyAndValue(filters.allMortalityFilters, 'key', 'autopsy')
                        },
                        {
                            filterGroup: false, collapse: true, allowGrouping: true,
                            filters: utilService.findByKeyAndValue(filters.allMortalityFilters, 'key', 'placeofdeath')
                        },
                        {
                            filterGroup: false, collapse: true, allowGrouping: true,
                            filters: utilService.findByKeyAndValue(filters.allMortalityFilters, 'key', 'weekday')
                        },
                        {
                            filterGroup: false, collapse: true, allowGrouping: true,
                            filters: utilService.findByKeyAndValue(filters.allMortalityFilters, 'key', 'month')
                        },
                        {
                            filterGroup: false, collapse: true,
                            filters: utilService.findByKeyAndValue(filters.ucdMcdFilters, 'key', 'ucd-filters')
                        },
                        {
                            filterGroup: false, collapse: true,
                            filters: utilService.findByKeyAndValue(filters.ucdMcdFilters, 'key', 'mcd-filters')
                        }
                    ]
                },
                {
                    key: 'mental_health', title: 'label.risk.behavior', primary: true, value:[], header:"Youth risk behavior",
                    allFilters: filters.yrbsFilters, searchResults: searchYRBSResults, dontShowInlineCharting: true,
                    additionalHeaders:filters.yrbsAdditionalHeaders, countLabel: 'Total',
                    sideFilters:[
                        {
                            filterGroup: false, collapse: false, allowGrouping: true, groupOptions: filters.columnGroupOptions, dontShowCounts: true,
                            filters: utilService.findByKeyAndValue(filters.yrbsFilters, 'key', 'year')
                        },
                        {
                            filterGroup: false, collapse: true, allowGrouping: true, groupOptions: filters.columnGroupOptions,
                            filters: utilService.findByKeyAndValue(filters.yrbsFilters, 'key', 'yrbsSex')
                        },
                        {
                            filterGroup: false, collapse: true, allowGrouping: true, groupOptions: filters.columnGroupOptions,
                            filters: utilService.findByKeyAndValue(filters.yrbsFilters, 'key', 'yrbsRace')
                        },
                        {
                            filterGroup: false, collapse: true, allowGrouping: true, groupOptions: filters.columnGroupOptions,
                            filters: utilService.findByKeyAndValue(filters.yrbsFilters, 'key', 'yrbsGrade')
                        },
                        {
                            filterGroup: false, collapse: true, allowGrouping: false,
                            filters: utilService.findByKeyAndValue(filters.yrbsFilters, 'key', 'question')
                        }
                    ]
                },
                {
                    key: 'bridge_race_sex', title: 'label.census.bridge.race.pop.estimate', primary: true, value:[], header:"Bridge Race POP Estimate",
                    allFilters: filters.censusFilters, searchResults: searchCensusInfo, dontShowInlineCharting: true, countLabel: 'Total', countQueryKey: 'pop',
                    sideFilters:[
                        {
                            filterGroup: false, collapse: false, allowGrouping: true, groupOptions: filters.groupOptions,
                            filters: utilService.findByKeyAndValue(filters.censusFilters, 'key', 'state'), dontShowCounts: true
                        },
                        {
                            filterGroup: false, collapse: false, allowGrouping: false, groupOptions: filters.groupOptions,
                            filters: utilService.findByKeyAndValue(filters.censusFilters, 'key', 'age'), dontShowCounts: true
                        },
                        {
                            filterGroup: false, collapse: false, allowGrouping: true, groupOptions: filters.groupOptions,
                            filters: utilService.findByKeyAndValue(filters.censusFilters, 'key', 'race'), dontShowCounts: true
                        },
                        {
                            filterGroup: false, collapse: false, allowGrouping: true, groupOptions: filters.groupOptions,
                            filters: utilService.findByKeyAndValue(filters.censusFilters, 'key', 'ethnicity'), dontShowCounts: true
                        },
                        {
                            filterGroup: false, collapse: false, allowGrouping: false, dontShowCounts: true,
                            filters: utilService.findByKeyAndValue(filters.censusFilters, 'key', 'current_year')
                        },
                        {
                            filterGroup: false, collapse: false, allowGrouping: true, groupOptions: filters.groupOptions,
                            filters: utilService.findByKeyAndValue(filters.censusFilters, 'key', 'sex'), dontShowCounts: true
                        }
                    ]
                }
            ];
            return filters;
        }

        /*Show will be implemented in phase two modal*/
        function showPhaseTwoModal(message) {
            ModalService.showModal({
                templateUrl: "app/partials/phaseTwo.html",
                controllerAs: 'pt',
                controller: function ($scope, close) {
                    var pt = this;
                    pt.message = message;
                    pt.close = close;
                }
            }).then(function(modal) {
                modal.element.show();

                modal.close.then(function(result) {
                    //remove all elements from array
                    modal.element.hide();
                });
            });
        }

        /**
         * Uploads png image to server
         * @param data
         * @returns {*}
         */
        function uploadImage(data) {
            var deferred = $q.defer();
            SearchService.uploadImage(data).then(function(response){
                deferred.resolve(response.data);
            });
            return deferred.promise;
        }
    }

}());
