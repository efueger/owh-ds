//TODO: consolidate with search.service.js
//TODO: split out some logic into separate services
//TODO: split json out into separate files
(function(){
    angular
        .module('owh.search')
        .service('searchFactory', searchFactory);

    searchFactory.$inject = ["utilService", "SearchService", "$q", "$translate", "chartUtilService", '$rootScope', '$timeout', 'ModalService', '$state', 'filterUtils'];

    function searchFactory( utilService, SearchService, $q, $translate, chartUtilService, $rootScope, $timeout, ModalService, $state, filterUtils){
        var service = {
            getAllFilters : getAllFilters,
            queryMortalityAPI: queryMortalityAPI,
            addCountsToAutoCompleteOptions: addCountsToAutoCompleteOptions,
            searchMortalityResults: searchMortalityResults,
            showPhaseTwoModal: showPhaseTwoModal,
            uploadImage: uploadImage,
            updateFilterValues: updateFilterValues,
            generateHashCode: generateHashCode,
            buildAPIQuery: buildAPIQuery,
            sortAutoCompleteOptions: sortAutoCompleteOptions,
            groupAutoCompleteOptions: groupAutoCompleteOptions,
            removeDisabledFilters: removeDisabledFilters,
            getQueryResults: getQueryResults,
            prepareChartData: prepareChartData,
            searchYRBSResults: searchYRBSResults,
            buildQueryForYRBS: buildQueryForYRBS,
            prepareMortalityResults: prepareMortalityResults,
            prepareQuestionChart: prepareQuestionChart


        };
        return service;

        function removeDisabledFilters(selectedFilter, filterView, availableFilters) {
            if(availableFilters[filterView]) {
                angular.forEach(selectedFilter.allFilters, function(filter, index) {
                    if(availableFilters[filterView].indexOf(filter.key) < 0) {
                        filter.value = [];
                        filter.groupBy = false;
                    }
                });
                angular.forEach(selectedFilter.sideFilters, function(filter, index) {
                    if(availableFilters[filterView].indexOf(filter.filters.key) < 0) {
                        filter.filters.value = [];
                        filter.filters.groupBy = false;
                    }
                });
            }
        }

        function groupAutoCompleteOptions(filter, sort) {
            var groupedOptions = [];
            var filterLength = 0;
            //build groupOptions object from autoCompleteOptions
            if(sort[filter.key]) {
                //find corresponding key in sort object
                for(var i = 0; i < sort[filter.key].length; i++) {
                    angular.forEach(filter.autoCompleteOptions, function(option) {
                        //if type string, then just a regular option
                        if(typeof sort[filter.key][i] === 'string') {
                            //not group option
                            if(sort[filter.key][i] === option.key) {
                                filterLength++;
                                groupedOptions.push(option);
                            }
                        } else {
                            //else, group option
                            //check if group option contains the filter option
                            //is same parent group option
                            if(sort[filter.key][i].key === option.key) {
                                groupedOptions.push(option);
                            }
                            //otherwise is child of group option
                            else if(sort[filter.key][i].options.indexOf(option.key) >= 0) {
                                var parentOption = {
                                    key: sort[filter.key][i].key,
                                    title: sort[filter.key][i].title,
                                    group: true,
                                    options: []
                                };
                                //if empty, add option
                                if(groupedOptions.length === 0) {
                                    filterLength++;
                                    groupedOptions.push(parentOption);
                                }
                                //go through already grouped options and find parent option
                                for(var j = 0; j < groupedOptions.length; j++) {
                                    var groupedOption = groupedOptions[j];
                                    if(groupedOption.key === sort[filter.key][i].key) {
                                        filterLength++;
                                        groupedOption.options.push(option);
                                        break;
                                    }
                                    //parent not found, add new group option for parent
                                    if(j === groupedOptions.length - 1) {
                                        filterLength++;
                                        groupedOptions.push(parentOption);
                                    }
                                }
                            }
                        }
                    });
                }
                //sort each group
                angular.forEach(groupedOptions, function(groupedOption, index) {
                    if(groupedOption.options) {
                        groupedOption.options.sort(function(a, b) {
                            return sort[filter.key][index].options.indexOf(a.key) - sort[filter.key][index].options.indexOf(b.key);
                        });
                    }
                });
                filter.autoCompleteOptions = groupedOptions;
                filter.filterLength = filterLength;
            }

        }

        function sortAutoCompleteOptions(filter, sort) {
            var sortedOptions = [];
            var filterLength = 0;
            //build sortedOptions object from autoCompleteOptions
            if(sort[filter.key]) {
                //find corresponding key in sort object
                for(var i = 0; i < sort[filter.key].length; i++) {
                    angular.forEach(filter.autoCompleteOptions, function(option) {
                        //if type string, then just a regular option
                        if(typeof sort[filter.key][i] === 'string' && !option.options) {
                            //not group option
                            if(sort[filter.key][i] === option.key) {
                                filterLength++;
                                sortedOptions.push(option);
                            }
                        } else {
                            //else, group option
                            //is same parent group option
                            if(option.options) {
                                angular.forEach(option.options, function (subOption) {
                                    if (sort[filter.key][i].options && sort[filter.key][i].options.indexOf(subOption.key) >= 0) {
                                        sortedOptions.push(subOption);
                                    }
                                });
                            } else {
                                if (sort[filter.key][i].options && sort[filter.key][i].options.indexOf(option.key) >= 0) {
                                    sortedOptions.push(option);
                                }
                            }
                        }
                    });
                }
                filter.autoCompleteOptions = sortedOptions;
                filter.filterLength = filterLength;
            }
        }

        //Search for YRBS data
        function searchYRBSResults( primaryFilter, queryID ) {
            var deferred = $q.defer();
            queryYRBSAPI(primaryFilter, queryID ).then(function(response){
                primaryFilter.data = response.data.table;
                //primaryFilter.chartData = response.chartData;
                primaryFilter.headers = response.headers;
                //primaryFilter.dataPrepared = true;
                deferred.resolve(response);
            });
            return deferred.promise;
        }

        //Query YRBS API
        function queryYRBSAPI( primaryFilter, queryID ) {
            var deferred = $q.defer();
            var apiQuery = buildQueryForYRBS(primaryFilter, true);
            var headers = apiQuery.headers;
            SearchService.searchResults(primaryFilter, queryID).then(function(response) {
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
                    data: response.data.resultData,
                    headers : headers,
                    queryJSON: response.data.queryJSON
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

        /**
         * Display chart for Selected YRBS Question
         * @param primaryFilter
         * @param question
         */
        function showChartForQuestion(primaryFilter, question) {

            prepareQuestionChart(primaryFilter, question).then(function (response) {
                chartUtilService.showExpandedGraph([response.chartData], question.title,
                    null, response.chartTypes, primaryFilter, question);
            });

        }

        /**
         * This function is used to build visualization data based on selected filters
         * If chart type is specified, visualization will be built for selected chart type
         * Otherwise visualizations will be decided with different combinations of selected filter
         * @param primaryFilter -> YRBS side filters
         * @param question -> Seleted question for which visualizations needs to be built
         * @param chartType -> Array of keys of selected combination e.g. ['yrbsSex', 'yrbsRace']
         */
        function prepareQuestionChart(primaryFilter, question, chartType ) {
            //make copy of side filters
            var copiedPrimaryFilter = angular.copy(primaryFilter);

            //get the selected side filters
            var selectedFilters = copiedPrimaryFilter.value;

            //possible chart combinations
            var chartMappings = {
                "yrbsSex&yrbsRace": "horizontalBar",
                "yrbsSex&yrbsGrade": "horizontalBar",
                "yrbsGrade&yrbsRace": "horizontalBar",
                "yrbsSex": "horizontalBar",
                "yrbsRace": "horizontalBar",
                "yrbsGrade": "horizontalBar",
            };

            var chartTypes = [];

            //collect all chart combinations
            selectedFilters.forEach( function(selectedPrimaryFilter) {
                selectedFilters.forEach( function(selectedSecondaryFilter) {
                    var chartType;
                    //for single filter
                    if (selectedPrimaryFilter === selectedSecondaryFilter) {
                        chartType = chartMappings[selectedPrimaryFilter.key];
                        if(chartType) {
                            chartTypes.push([selectedPrimaryFilter.key]);
                        }
                    } else {//for combinations of two filters
                        chartType = chartMappings[selectedPrimaryFilter.key + '&' + selectedSecondaryFilter.key];
                        if(chartType) {
                            chartTypes.push([selectedPrimaryFilter.key, selectedSecondaryFilter.key]);
                        }
                    }
                });
            });

            //reset all grouping combinations
            utilService.updateAllByKeyAndValue(copiedPrimaryFilter.allFilters, 'groupBy', false);

            //get the question filter and update question filter with selected question
            var questionFilter = utilService.findByKeyAndValue(copiedPrimaryFilter.allFilters, 'key', 'question');
            questionFilter.value = [question.qkey];

            //if chart type is not specified, select first from possible combinations
            if(!chartType) {
                chartType = chartTypes[0];
            }

            var chartFilters = [];
            //set column groupings on selected chart
            angular.forEach(chartType, function(eachKey) {
                var eachFilter = utilService.findByKeyAndValue(copiedPrimaryFilter.allFilters, 'key', eachKey);
                eachFilter.groupBy = 'column';
                eachFilter.getPercent = true;
                chartFilters.push(eachFilter);
            });

            var deferred = $q.defer();
            //calculate query hash
            generateHashCode(copiedPrimaryFilter).then(function (hash) {
                //get the chart data
                SearchService.searchResults(copiedPrimaryFilter, hash).then(function(response) {
                    var chartData;
                    //chart data for single filter
                    if (chartFilters.length == 1) {
                        chartData = chartUtilService.horizontalBar(chartFilters[0],
                            chartFilters[0], response.data.resultData.table, copiedPrimaryFilter, '%');
                    } else {//chart data for two filters
                        chartData = chartUtilService.horizontalBar(chartFilters[0],
                            chartFilters[1], response.data.resultData.table, copiedPrimaryFilter, '%');
                    }
                    deferred.resolve({
                        chartData: chartData,
                        chartTypes : chartTypes
                    });
                });
            });
            return deferred.promise;
        }


        function prepareMortalityResults(primaryFilter, response) {
            primaryFilter.count = response.sideFilterResults.pagination.total;
            angular.forEach(response.sideFilterResults.data.simple, function (eachFilterData, key) {
                //fill auto-completer data with counts
                var filter = utilService.findByKeyAndValue(primaryFilter.allFilters, 'key', key);
                if (filter) {
                    if (filter.autoCompleteOptions) {
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
                        angular.forEach(eachFilterData, function (eachData) {
                            var eachOption = {key: eachData.name, title: eachData.name};
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
        }

        function removeSearchResults(ac){
            if(ac){
                for (var i =0; i < ac.length; i++ ){
                    delete ac[i].deaths;
                    delete ac[i].count;
                    delete ac[i].deathsPercentage;
                }
            }
        }
        function createBackendSearchRequest(pFilter){
            var req = {};
            req.key= pFilter.key;
            req.searchFor = pFilter.searchFor;
            req.tableView = pFilter.tableView;
            req.allFilters = []
            for (var i = 0; i< pFilter.allFilters.length; i++){
                var filter = utilService.clone(pFilter.allFilters[i]);
                // Clear autocomplete options for mcd and ucd
                if( i == 9 || i == 12){
                    filter.autoCompleteOptions = [];
                }
                removeSearchResults(filter.autoCompleteOptions);
                req.allFilters.push(filter);
            }
            req.sideFilters = [];
            for (var i = 0; i< pFilter.sideFilters.length; i++){
                var filter = utilService.clone(pFilter.sideFilters[i]);
                // Clear autocomplete options for mcd and ucd
                if( i == 9 || i == 10){
                    filter.autoCompleteOptions = [];
                    filter.filters.autoCompleteOptions[0].autoCompleteOptions = [];
                }
                removeSearchResults(filter.autoCompleteOptions);
                if(filter.filters.autoCompleteOptions){
                    removeSearchResults(filter.filters.autoCompleteOptions[0].autoCompleteOptions);
                }
                req.sideFilters.push(filter);
            }
            return req;
        }


        function searchMortalityResults(primaryFilter, queryID) {
            var deferred = $q.defer();
            queryMortalityAPI(primaryFilter, queryID).then(function(response){
                prepareMortalityResults(primaryFilter, response);
                deferred.resolve(response);
            });
            return deferred.promise;
        }

        function generateHashCode(primaryFilter) {
            var deferred = $q.defer();
            var hashQuery = buildHashcodeQuery(primaryFilter);
            SearchService.generateHashCode(hashQuery).then(function(response) {
                deferred.resolve(response.data);
            });
            return deferred.promise;
        }

        function buildHashcodeQuery(primaryFilter) {

            var hashQuery = {
                primaryKey: primaryFilter.key,
                tableView: primaryFilter.tableView,
                filters: []
            };

            angular.forEach(primaryFilter.sideFilters, function(filter){
                hashQuery.filters.push({
                    key: filter.filters.key,
                    groupBy: filter.filters.groupBy,
                    value: filter.filters.value.sort()
                });
            });
            return hashQuery;
        }

        /**
         * Get owhquery_cache data using queryID
         * @param queryId
         * @returns {Function}
         */
        function getQueryResults(queryId) {
            var deferred = $q.defer();
            SearchService.searchResults(null,queryId).then(function(response) {
                deferred.resolve(response);
            });
            return deferred.promise;
        }

        //search results by grouping
        function queryMortalityAPI( primaryFilter, queryID) {
            var deferred = $q.defer();
            //@TODO we are bulding api query at server side, but still using this method to build headers
            var apiQuery = buildAPIQuery(primaryFilter);
            var headers = apiQuery.headers;
            //var query = apiQuery.apiQuery;
            //Passing completed primaryFilters to backend and building query at server side
            SearchService.searchResults(createBackendSearchRequest(primaryFilter), queryID).then(function(response) {
                //resolve data for controller
                //need to build headers with primary filter returned from backend in order for charts to build properly
                if(response.data.queryJSON) {
                    headers = buildAPIQuery(response.data.queryJSON).headers;
                }
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
                //for current_year dhow line graph
                if (header.key == 'current_year') {
                    chartData.push(chartUtilService.lineChart(pieData, header, primaryFilter));
                } else {//for other single filters, show pie chart
                    chartData.push(chartUtilService.pieChart(pieData, header, primaryFilter));
                }
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
            //need to calculate value length for group options, as the parent option can count as extra value
            var valueLength = filter.value.length;
            angular.forEach(filter.autoCompleteOptions, function(option) {
                if(option.options) {
                    if(filter.value.indexOf(option.key) >= 0) {
                        valueLength--;
                    }
                }
            });
            if( utilService.isValueNotEmpty(filter.value) && valueLength !== getAutoCompleteOptionsLength(filter)) {
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
            //take into account group options length
            var length = filter.autoCompleteOptions ? filter.autoCompleteOptions.length : 0;
            if(filter.autoCompleteOptions) {
                angular.forEach(filter.autoCompleteOptions, function(option) {
                    if(option.options) {
                        //if value has group option, then don't subtract from calculated length
                        if(filter.value.indexOf(option.key) < 0) {
                            length--;
                        }
                        length += option.options.length;
                    }
                });
            }
            return length;
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

        function queryCensusAPI( primaryFilter, queryID ) {
            var deferred = $q.defer();
            SearchService.searchResults(primaryFilter, queryID).then(function(response) {
                deferred.resolve({
                    data : response.data.resultData.nested.table,
                    headers : response.data.resultData.headers,
                    sideFilterResults: response.data.sideFilterResults,
                    chartData: prepareChartData(response.data.resultData.headers, response.data.resultData.nested, primaryFilter),
                    totalCount: response.pagination.total
                })
            });
            return deferred.promise;
        }

        /**
         * Update the total count in side filter options
         * @param primaryFilter
         * @param sideFilterData
         */
        function updateSideFilterPopulationCount(primaryFilter, sideFilterData) {
            angular.forEach(sideFilterData, function (eachFilterData, key) {
                //get the filter
                var filter = utilService.findByKeyAndValue(primaryFilter.allFilters, 'key', key);
                if (filter) {
                    //assign total count to all options
                    if (filter.autoCompleteOptions) {
                        angular.forEach(filter.autoCompleteOptions, function (option) {
                            var optionData = utilService.findByKeyAndValue(eachFilterData, 'name', option.key);
                            if (optionData) {
                                option[primaryFilter.key] = optionData[primaryFilter.key];
                            } else {
                                option[primaryFilter.key] = 0;
                            }
                        });
                    }
                }
            });
        }

        /**
         * Search census bridge race population estmation
         */
        function searchCensusInfo(primaryFilter, queryID) {
            var deferred = $q.defer();

            queryCensusAPI(primaryFilter, queryID).then(function(response){
                primaryFilter.data = response.data;
                primaryFilter.headers = response.headers;
                primaryFilter.chartData = response.chartData;
                //update total population count for side filters
                debugger;
                updateSideFilterPopulationCount(primaryFilter, response.sideFilterResults.data.simple);
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
            //TODO check with @Gopal why mapping json don't have 'Other'
            filters.races = [
                {key: 'American Indian',title: 'American Indian'},
                {key: 'Asian or Pacific Islander',title: 'Asian or Pacific Islander'},
                {key: 'Black',title: 'Black'},
                {key: 'Other (Puerto Rico only)',title: 'Other (Puerto Rico only)'},
                {key: 'White',title: 'White'}
            ];
            filters.hispanicOptions = [
                {"key":"Central American","title":"Central American"},
                {"key":"Central and South American","title":"Central and South American"},
                {"key":"Cuban","title":"Cuban"},
                {"key":"Dominican","title":"Dominican"},
                {"key":"Latin American","title":"Latin American"},
                {"key":"Mexican","title":"Mexican"},
                {"key":"Non-Hispanic","title":"Non-Hispanic"},
                {"key":"Other Hispanic","title":"Other Hispanic"},
                {"key":"Puerto Rican","title":"Puerto Rican"},
                {"key":"South American","title":"South American"},
                {"key":"Spaniard","title":"Spaniard"},
                {"key":"Unknown","title":"Unknown"}
            ];

            filters.ethnicityGroupOptions = [
                {"key": 'Hispanic', "title": 'Hispanic'},
                {"key": 'Non-Hispanic', "title": "Non-Hispanic"}
            ];

            filters.weekday = [
                {key: 'Sunday', title: 'Sunday'},
                {key: 'Monday', title: 'Monday'},
                {key: 'Tuesday', title: 'Tuesday'},
                {key: 'Wednesday', title: 'Wednesday'},
                {key: 'Thursday', title: 'Thursday'},
                {key: 'Friday', title: 'Friday'},
                {key: 'Saturday', title: 'Saturday'},
                {key: 'Unknown', title: 'Unknown'}
            ];

            filters.autopsy = [
                {key: 'Yes', title: 'Yes'},
                {key: 'No', title: 'No'},
                {key: 'Unknown', title: 'Unknown'}
            ];

            filters.podOptions = [
                {key:'Decedent’s home',title:'Decedent’s home'},
                {key:'Hospital, clinic or Medical Center - Patient status unknown',title:'Hospital, clinic or Medical Center-  Patient status unknown'},
                {key:'Hospital, Clinic or Medical Center - Dead on Arrival',title:'Hospital, Clinic or Medical Center-  Dead on Arrival'},
                {key:'Hospital, clinic or Medical Center - Inpatient',title:'Hospital, clinic or Medical Center-  Inpatient'},
                {key:'Hospital, Clinic or Medical Center - Outpatient or admitted to Emergency Room',title:'Hospital, Clinic or Medical Center-  Outpatient or admitted to Emergency Room'},
                {key:'Nursing home/long term care',title:'Nursing home/long term care'},
                {key:'Place of death unknown',title:'Place of death unknown'},
                {key:'Other',title:'Other'}
            ];

            filters.maritalStatuses = [
                {key:'M',title:'Married'},
                {key:'S',title:'Never married, single'},
                {key:'W',title:'Widowed'},
                {key:'D',title:'Divorced'},
                {key:'U',title:'Marital Status unknown'}
            ];

            filters.ageOptions = [
                {key:'0-4years',title:'0 - 4 years', min: 1, max: 5},
                {key:'5-9years',title:'5 - 9 years', min: 6, max: 10},
                {key:'10-14years',title:'10 - 14 years', min: 11, max: 15},
                {key:'15-19years',title:'15 - 19 years', min: 16, max: 20},
                {key:'20-24years',title:'20 - 24 years', min: 21, max: 25},
                {key:'25-29years',title:'25 - 29 years', min: 26, max: 30},
                {key:'30-34years',title:'30 - 34 years', min: 31, max: 35},
                {key:'35-39years',title:'35 - 39 years', min: 36, max: 40},
                {key:'40-44years',title:'40 - 44 years', min: 41, max: 45},
                {key:'45-49years',title:'45 - 49 years', min: 46, max: 50},
                {key:'50-54years',title:'50 - 54 years', min: 51, max: 55},
                {key:'55-59years',title:'55 - 59 years', min: 56, max: 60},
                {key:'60-64years',title:'60 - 64 years', min: 61, max: 65},
                {key:'65-69years',title:'65 - 69 years', min: 66, max: 70},
                {key:'70-74years',title:'70 - 74 years', min: 71, max: 75},
                {key:'75-79years',title:'75 - 79 years', min: 76, max: 80},
                {key:'80-84years',title:'80 - 84 years', min: 81, max: 85},
                {key:'85-89years',title:'85 - 89 years', min: 86, max: 90},
                {key:'90-94years',title:'90 - 94 years', min: 91, max: 95},
                {key:'95-99years',title:'95 - 99 years', min: 96, max: 100},
                {key:'100years and over',title:'>100', min: 101, max: 105},
                {key:'Age not stated',title:'Age not stated', min: -5, max: 0}
            ];

            filters.genderOptions=[
                {key:'Female',title:'Female'},
                {key:'Male',title:'Male'}
            ];

            filters.yearOptions = [];

            filters.modOptions = [
                {key:'January',title:'January'},
                {key:'February',title:'February'},
                {key:'March',title:'March'},
                {key:'April',title:'April'},
                {key:'May',title:'May'},
                {key:'June',title:'June'},
                {key:'July',title:'July'},
                {key:'August',title:'August'},
                {key:'September',title:'September'},
                {key:'October',title:'October'},
                {key:'November',title:'November'},
                {key:'December',title:'December'}
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
                callback: function(value, release) {
                    var self = this;
                    var values = value.split(';');
                    var minValue = Number(values[0]);
                    var maxValue = Number(values[1]);
                    var agegroupFilter = utilService.findByKeyAndValue(filters.allMortalityFilters, 'key', 'agegroup');

                    var prevValue = angular.copy(agegroupFilter.value);
                    agegroupFilter.value = [];
                    // set the values list only if the slider selection is different from the default
                    if(! (minValue == -5  && maxValue == 105)){
                        angular.forEach(agegroupFilter.autoCompleteOptions, function(eachOption) {
                            if((eachOption.min <= minValue && eachOption.max >= minValue)
                                || (eachOption.min >= minValue && eachOption.max <= maxValue)
                                || (eachOption.min <= maxValue && eachOption.max >= maxValue)) {
                                agegroupFilter.value.push(eachOption.key);
                            }
                        });
                    }

                    if(!agegroupFilter.timer && !angular.equals(prevValue, agegroupFilter.value) && filters.selectedPrimaryFilter.initiated) {
                        agegroupFilter.timer = $timeout(function(){
                            agegroupFilter.timer=undefined;
                            // TODO: We need to call the searchController.search(true) from here, istead of the following lines
                            // generateHashCode(filters.selectedPrimaryFilter).then(function(hash){
                            //     filters.selectedPrimaryFilter.searchResults(filters.selectedPrimaryFilter, hash);
                            // });
                            self.search();

                        }, 2000);
                    }
                }
            };

            filters.yrbsGenderOptions =  [
                { "key": "Female", "title": "Female" },
                { "key": "Male", "title": "Male" }
            ];

            filters.yrbsRaceOptions =  [
                { "key": "Am Indian / Alaska Native", "title": "American Indian or Alaska Native" },
                { "key": "Asian", "title": "Asian" },
                { "key": "Black or African American", "title": "Black or African American" },
                { "key": "Hispanic/Latino", "title": "Hispanic or Latino" },
                { "key": "Native Hawaiian/other PI", "title": "Native Hawaiian or Other Pacific Islander" },
                { "key": "White", "title": "White" },
                { "key": "Multiple - Non-Hispanic", "title": "Multiple Race" }
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
                { "key": "2009", "title": "2009" },
                { "key": "2007", "title": "2007" },
                { "key": "2005", "title": "2005" },
                { "key": "2003", "title": "2003" },
                { "key": "2001", "title": "2001" },
                { "key": "1999", "title": "1999" },
                { "key": "1997", "title": "1997" },
                { "key": "1995", "title": "1995" },
                { "key": "1993", "title": "1993" },
                { "key": "1991", "title": "1991" }
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
                    selectTitle: 'select.label.yrbs.filter.question', updateTitle: 'update.label.yrbs.filter.question',  iconClass: 'fa fa-pie-chart purple-text',
                    onIconClick: function(question) {
                        showChartForQuestion(filters.selectedPrimaryFilter, question);
                    }
                }
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

            filters.censusFilters = filterUtils.getBridgeDataFilters();

            filters.search = [
                {
                    key: 'deaths', title: 'label.filter.mortality', primary: true, value: [], header:"Mortality",
                    allFilters: filters.allMortalityFilters, searchResults: searchMortalityResults, showMap:true,
                    chartAxisLabel:'Deaths', countLabel: 'Number of Deaths', mapData:{}, tableView:'number_of_deaths',
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
                    additionalHeaders:filters.yrbsAdditionalHeaders, countLabel: 'Total', tableView:'mental_health',
                    chartAxisLabel:'Percentage',
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
                    key: 'bridge_race', title: 'label.census.bridge.race.pop.estimate', primary: true, value:[], header:"Bridged-Race Population Estimates",
                    allFilters: filters.censusFilters, searchResults: searchCensusInfo, dontShowInlineCharting: true,
                    chartAxisLabel:'Population', countLabel: 'Total', countQueryKey: 'pop', tableView:'bridge_race',
                    sideFilters:[
                        {
                            filterGroup: false, collapse: false, allowGrouping: true,
                            filters: utilService.findByKeyAndValue(filters.censusFilters, 'key', 'current_year')
                        },
                        {
                            filterGroup: false, collapse: true, allowGrouping: true, groupOptions: filters.groupOptions,
                            filters: utilService.findByKeyAndValue(filters.censusFilters, 'key', 'sex')
                        },
                        {
                            filterGroup: false, collapse: true, allowGrouping: true, groupOptions: filters.groupOptions,
                            filters: utilService.findByKeyAndValue(filters.censusFilters, 'key', 'agegroup')
                        },
                        {
                            filterGroup: false, collapse: true, allowGrouping: true, groupOptions: filters.groupOptions,
                            filters: utilService.findByKeyAndValue(filters.censusFilters, 'key', 'race')
                        },
                        {
                            filterGroup: false, collapse: true, allowGrouping: true, groupOptions: filters.groupOptions,
                            filters: utilService.findByKeyAndValue(filters.censusFilters, 'key', 'ethnicity')
                        },
                        {
                            filterGroup: false, collapse: true, allowGrouping: true, groupOptions: filters.groupOptions,
                            filters: utilService.findByKeyAndValue(filters.censusFilters, 'key', 'state')
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
