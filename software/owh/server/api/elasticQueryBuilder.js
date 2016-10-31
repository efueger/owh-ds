const util = require('util');
var merge = require('merge');

var prepareCensusAggregationQuery = function(aggregations) {
    var censusQuery = {};
    censusQuery.aggregations = {};
    if (aggregations['nested']) {
        if (aggregations['nested']['table'] && aggregations['nested']['table'].length > 0) {
            censusQuery.aggregations = merge(censusQuery.aggregations, generateNestedCensusAggQuery(aggregations['nested']['table'], 'group_table_'));
        }
    }
    return censusQuery;
};

var generateNestedCensusAggQuery = function(aggregations, groupByKeyStart) {
    var aggQuery = generateCensusAggregationQuery(aggregations[0], groupByKeyStart);
    if(aggregations.length > 1) {
        aggQuery[Object.keys(aggQuery)[0]].aggregations = generateNestedCensusAggQuery(aggregations.slice(1), groupByKeyStart);
    }else{
        aggQuery[Object.keys(aggQuery)[0]].aggregations = {
            "pop": {
                "sum": {
                    "field": "pop"
                }
            }
        };
    }
    return aggQuery;
};

var generateCensusAggregationQuery = function( aggQuery, groupByKeyStart ) {
    groupByKeyStart = groupByKeyStart ? groupByKeyStart : '';
    var query = {};
    query[ groupByKeyStart + aggQuery.key] = {
        "terms": {
            "field": aggQuery.queryKey,
            "size": aggQuery.size
        }
    };
    return query;
};

var prepareAggregationQuery = function(aggregations) {
    console.log(aggregations);
    var elasticQuery = {};
    elasticQuery.aggregations = {};
    //build array for
    if(aggregations['simple']) {
        for (var i = 0; i < aggregations['simple'].length; i++) {
            elasticQuery.aggregations = merge(elasticQuery.aggregations, generateAggregationQuery(aggregations['simple'][i]));
        }
    }
    if (aggregations['nested']) {
        if (aggregations['nested']['table'] && aggregations['nested']['table'].length > 0) {
            elasticQuery.aggregations = merge(elasticQuery.aggregations, generateNestedAggQuery(aggregations['nested']['table'], 'group_table_'));
        }
        if (aggregations['nested']['charts']) {
            for(var index in aggregations['nested']['charts']) {
                elasticQuery.aggregations = merge(elasticQuery.aggregations, generateNestedAggQuery(aggregations['nested']['charts'][index], 'group_chart_' + index + '_'));
            }
        }
        if (aggregations['nested']['maps']) {
            for(var index in aggregations['nested']['maps']) {
                elasticQuery.aggregations = merge(elasticQuery.aggregations, generateNestedAggQuery(aggregations['nested']['maps'][index], 'group_maps_' + index + '_'));
            }
        }
    }
    console.log(JSON.stringify(elasticQuery));
    return elasticQuery;
};

var generateNestedAggQuery = function(aggregations, groupByKeyStart) {
    var aggQuery = generateAggregationQuery(aggregations[0], groupByKeyStart);
    if(aggregations.length > 1) {
        aggQuery[Object.keys(aggQuery)[0]].aggregations = generateNestedAggQuery(aggregations.slice(1), groupByKeyStart);
    }
    return aggQuery;
};

var generateAggregationQuery = function( aggQuery, groupByKeyStart ) {
    groupByKeyStart = groupByKeyStart ? groupByKeyStart : '';
    var query = {};
    query[ groupByKeyStart + aggQuery.key] = {
        "terms": {
            "field": aggQuery.queryKey,
            "size": aggQuery.size
        }
    };
    return query;
};

/**
 *
 * @param query
 * @param results
 * @param dataset
 * @param hashcode
 * @returns {{}}
 */
var buildInsertQueryResultsQuery = function (query, results, dataset, hashcode, sideFilterResults) {
    var insertQuery = {};
    insertQuery.queryJSON = query;
    insertQuery.resultJSON = results;
    insertQuery.dataset = dataset;  //Find a way to get dataset value
    //@TODO current data with yyy-mm-dd format
    insertQuery.lastupdated = "2016-10-25";
    insertQuery.queryID = hashcode;
    insertQuery.sideFilterResults = sideFilterResults;
    return insertQuery;
};


var buildSearchQueryResultsQuery = function(hascode) {
    var searchQuery = {
        "query": {
            "match": {
                "queryID": hascode
            }
        }
    }
    return searchQuery;
};

/**
 * Builds a search query
 * @param params
 * @param isAggregation
 * @returns {{}}
 */
var buildSearchQuery = function(params, isAggregation) {
    var userQuery = params.query ? params.query : {};
    var elasticQuery = {};
    var censusQuery = undefined;
    if ( isAggregation ){
        elasticQuery.size = 0;
        elasticQuery = merge(elasticQuery, prepareAggregationQuery(params.aggregations));
        if(params.aggregations['nested'] && params.aggregations['nested']['table']){
            censusQuery = prepareCensusAggregationQuery(params.aggregations);
        }

    } else {
        elasticQuery.from = params.pagination.from;
        elasticQuery.size = params.pagination.size;
    }
    elasticQuery.query = {};
    elasticQuery.query.filtered = {};

    //build top level bool queries
    var primaryQuery = buildTopLevelBoolQuery(groupByPrimary(userQuery, true), true);
    var filterQuery = buildTopLevelBoolQuery(groupByPrimary(userQuery, false), false);

    //check if primary query is empty
    elasticQuery.query.filtered.query = primaryQuery;
    elasticQuery.query.filtered.filter = filterQuery;
    if(censusQuery) {
        censusQuery.query = {};
        censusQuery.query.filtered = {};

        censusQuery.query.filtered.query = primaryQuery;
        censusQuery.query.filtered.filter = filterQuery;
    }
    return [elasticQuery, censusQuery];
};

//build top-level bool query
var buildTopLevelBoolQuery = function(filters, isQuery) {
    var topLevelBoolQuery = {
        bool: {
            must: []
        }
    };
    for (var i=0 in filters) { //primary filters
        var path = filters[i].queryKey;
        var boolQuery = buildBoolQuery(path, filters[i].value, isQuery, filters[i].caseChange, filters[i].dataType);
        if(!isEmptyObject(boolQuery)) {
            topLevelBoolQuery.bool.must.push(boolQuery);
        }
    }
    return topLevelBoolQuery;
};

var buildBoolQuery = function(path, value, isQuery, isCaseChange, dataType) {
    var boolQuery = {};
    boolQuery.bool = {};
    if (path && path !== "" ){
        if (util.isArray(path)){
            for (var i=0 in path) {
                if (dataType === 'date'){
                    boolQuery.bool['should'] = buildDateQuery(path[i], value)
                } else if(isQuery) {
                    boolQuery.bool['should'] = buildMatchQuery(path[i], value, isCaseChange)
                } else {
                    boolQuery.bool['should'] = buildTermQuery(path[i], value, isCaseChange)
                }
            }
        } else if(typeof path === 'string') {
            if (dataType === 'date'){
                boolQuery.bool['should'] = buildDateQuery(path, value, isCaseChange)
            } else if (isQuery){
                boolQuery.bool['should'] = buildMatchQuery(path, value, isCaseChange)
            } else {
                boolQuery.bool['should'] = buildTermQuery(path, value, isCaseChange)
            }
        }
    }
    return boolQuery;
};

var buildMatchQuery = function(path, value, isCaseChange) {
    var matchQuery = [];
    if (util.isArray(value)) {
        for (var i=0 in value) {
            var eachMatchQuery = {match: {}};
            eachMatchQuery.match[path] = isCaseChange ? value[i].toLowerCase() : value[i] ;
            matchQuery.push(eachMatchQuery);
        }
    } else {
        var eachMatchQuery = {match: {}};
        eachMatchQuery.match[path] =  isCaseChange ?  value.toLowerCase() : value ;
        matchQuery.push(eachMatchQuery);
    }
    return matchQuery;
};

var buildTermQuery = function(path, value, isCaseChange) {
    var termQuery = [];
    if (util.isArray(value)) {
        for (var i=0 in value) {
            var eachMatchQuery = {term: {}};
            eachMatchQuery.term[path] = isCaseChange ? value[i].toLowerCase() : value[i] ;
            termQuery.push(eachMatchQuery);
        }
    } else {
        var eachMatchQuery = {term: {}};
        eachMatchQuery.term[path] = isCaseChange ? value.toLowerCase() : value ;
        termQuery.push(eachMatchQuery);
    }
    return termQuery;
};

var buildDateQuery = function(path, value, isCaseChange) {
    var termQuery = [];
    if (!util.isObject(value)) {
        value = {
            from: value,
            to: value
        };
    }

    var eachMatchQuery = {range: {}};
    eachMatchQuery.range[path] = {
        gte: value.from,
        lte: value.to ? value.to : 'now'
    };
    termQuery.push(eachMatchQuery);

    return termQuery;
};

var groupByPrimary = function(filterQuery, primaryValue) {
    var filters = [];
    for (var key in filterQuery) {
        if (filterQuery[key].primary === primaryValue) {
            filters.push(filterQuery[key])
        }
    }
    return filters;
};


var isEmptyObject = function(obj) {
    return !Object.keys(obj).length;
};

function buildAPIQuery(primaryFilter) {
   var apiQuery = {
        searchFor: primaryFilter.key,
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
    var sortedFilters = sortByKey(clone(primaryFilter.allFilters), getAutoCompleteOptionsLength);
    sortedFilters.forEach  (function(eachFilter) {
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

function clone(a) {
    return JSON.parse(JSON.stringify(a));
}

function sortByKey(array, key, asc) {
    return array.sort(function(a, b) {
        var x = typeof(key) === 'function' ? key(a) : a[key];
        var y = typeof(key) === 'function' ? key(b) : b[key];
        if(asc===undefined || asc === true) {
            return ((x < y) ? -1 : ((x > y) ? 1 : 0));
        }else {
            return ((x > y) ? -1 : ((x < y) ? 1 : 0));
        }
    });
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
    if( isValueNotEmpty(filter.value) && filter.value.length !== getAutoCompleteOptionsLength(filter)) {
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

function isValueNotEmpty(value) {
    return typeof value != 'undefined' && value !== null && !isEmptyObject(value) &&
        (!typeof value === 'String' || value != '');
}

function getAutoCompleteOptionsLength(filter) {
    return filter.autoCompleteOptions ? filter.autoCompleteOptions.length : 0;
}

function prepareChartAggregations(headers) {
    var chartHeaders = [];
    var chartAggregations = [];
    headers.forEach( function(eachPrimaryHeader) {
        var primaryGroupQuery = getGroupQuery(eachPrimaryHeader);
        headers.forEach( function(eachSecondaryHeader) {
            var chartType = chartMappings[eachPrimaryHeader.key + '&' + eachSecondaryHeader.key];
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

var chartMappings = {
    "gender&race": "horizontalStack",
    "race&agegroup": "verticalStack",
    "gender&agegroup":	"horizontalBar",
    "race&hispanicOrigin": "horizontalStack",
    "gender&hispanicOrigin": "verticalBar",
    "agegroup&hispanicOrigin": "verticalStack",
    "race&autopsy": "verticalStack",
    "gender&autopsy": "verticalBar",
    "agegroup&autopsy": "horizontalBar",
    "gender&placeofdeath": "verticalStack"
};

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

function addCountsToAutoCompleteOptions(primaryFilter) {
   var apiQuery = {
        searchFor: primaryFilter.key,
        aggregations: { simple: [] }
    };
    var filters = [];
    primaryFilter.sideFilters.forEach(function(eachSideFilter) {
        filters = filters.concat(eachSideFilter.filterGroup ? eachSideFilter.filters : [eachSideFilter.filters]);
    });
     filters.forEach(function(eachFilter) {
        apiQuery.aggregations.simple.push(getGroupQuery(eachFilter));
     });
    //if(query) {
        var filterQuery = buildAPIQuery(primaryFilter).apiQuery.query;
        apiQuery.query = filterQuery;
    //}
    return apiQuery;
}
module.exports.prepareAggregationQuery = prepareAggregationQuery;
module.exports.buildSearchQuery = buildSearchQuery;
module.exports.isEmptyObject = isEmptyObject;
module.exports.buildInsertQueryResultsQuery = buildInsertQueryResultsQuery;
module.exports.buildSearchQueryResultsQuery = buildSearchQueryResultsQuery;
module.exports.buildAPIQuery = buildAPIQuery;
module.exports.addCountsToAutoCompleteOptions = addCountsToAutoCompleteOptions;
