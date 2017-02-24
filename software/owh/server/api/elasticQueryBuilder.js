const util = require('util');
var merge = require('merge');

var prepareCensusAggregationQuery = function(aggregations) {
    var censusQuery = { size: 0};
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
    if(aggQuery.key === 'mother_race') {
        aggQuery.key = 'race';
        aggQuery.queryKey = 'race';
    }

    query[ groupByKeyStart + aggQuery.key] = {
        "terms": {
            "field": aggQuery.queryKey,
            "size": aggQuery.size
        }
    };
    return query;
};

var prepareAggregationQuery = function(aggregations, countQueryKey) {
    var elasticQuery = {};
    elasticQuery.aggregations = {};
    //build array for
    if(aggregations['simple']) {
        for (var i = 0; i < aggregations['simple'].length; i++) {
            elasticQuery.aggregations = merge(elasticQuery.aggregations, generateAggregationQuery(aggregations['simple'][i], undefined, countQueryKey));
        }
    }
    if (aggregations['nested']) {
        if (aggregations['nested']['table'] && aggregations['nested']['table'].length > 0) {
            elasticQuery.aggregations = merge(elasticQuery.aggregations, generateNestedAggQuery(aggregations['nested']['table'], 'group_table_', countQueryKey));
        }
        if (aggregations['nested']['charts']) {
            for(var index in aggregations['nested']['charts']) {
                elasticQuery.aggregations = merge(elasticQuery.aggregations, generateNestedAggQuery(aggregations['nested']['charts'][index], 'group_chart_' + index + '_', countQueryKey));
            }
        }
        if (aggregations['nested']['maps']) {
            for(var index in aggregations['nested']['maps']) {
                elasticQuery.aggregations = merge(elasticQuery.aggregations, generateNestedAggQuery(aggregations['nested']['maps'][index], 'group_maps_' + index + '_', countQueryKey, true));
            }
        }
    }
    console.log(JSON.stringify(elasticQuery));
    return elasticQuery;
};

var generateNestedAggQuery = function(aggregations, groupByKeyStart, countQueryKey) {
    var aggQuery = generateAggregationQuery(aggregations[0], groupByKeyStart, countQueryKey);
    if(aggregations.length > 1) {
        aggQuery[Object.keys(aggQuery)[0]].aggregations = generateNestedAggQuery(aggregations.slice(1), groupByKeyStart, countQueryKey);
    }
    return aggQuery;
};

var generateAggregationQuery = function( aggQuery, groupByKeyStart, countQueryKey ) {
    groupByKeyStart = groupByKeyStart ? groupByKeyStart : '';
    var query = {};

    //for bridge race sex data
    if(countQueryKey == 'pop') {
        query[ groupByKeyStart + aggQuery.key] = getTermQuery(aggQuery);
        query[ groupByKeyStart + aggQuery.key].aggregations=getPopulationSumQuery();
        merge(query, getPopulationSumQuery());
    } else {//for yrbs and mortality
        query[ groupByKeyStart + aggQuery.key] = getTermQuery(aggQuery);
    }
    return query;
};

/**
 * Preapare term query
 * @param aggQuery
 * @returns {{terms: {field: *, size: *}}}
 */
function getTermQuery(aggQuery) {
    return {
        "terms": {
            "field": aggQuery.queryKey,
            "size": aggQuery.size
        }
    }
}

/**
 * prepare population sum query
 * @returns {{group_count_pop: {sum: {field: string}}}}
 */
function getPopulationSumQuery() {
    return {
        "group_count_pop": {
            "sum": {
                "field": "pop"
            }
        }
    }
}

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
        elasticQuery = merge(elasticQuery, prepareAggregationQuery(params.aggregations, params.countQueryKey));
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
    //if(value)
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
            if(path == 'dob_yy') {
                path = 'current_year';
            }
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

// Obsolete code
// function buildQueryForYRBS(primaryFilter, dontAddYearAgg) {
//     var result = buildAPIQuery(primaryFilter);
//     var apiQuery = result.apiQuery;
//     var headers = result.headers;
//     var resultFilter = headers.columnHeaders.length > 0 ? headers.columnHeaders[0] : headers.rowHeaders[0];
//     var resultAggregation = findByKeyAndValue(apiQuery.aggregations.nested.table, 'key', resultFilter.key);
//     resultAggregation.isPrimary = true;
//     apiQuery.dataKeys = findAllNotContainsKeyAndValue(resultFilter.autoCompleteOptions, 'isAllOption', true);
//     headers.columnHeaders.concat(headers.rowHeaders).forEach(function(eachFilter) {
//         var allValues = getValuesByKeyIncludingKeyAndValue(eachFilter.autoCompleteOptions, 'key', 'isAllOption', true);
//         if(eachFilter.key === resultFilter.key) {
//             if(apiQuery.query[eachFilter.queryKey]) {
//                 apiQuery.query[eachFilter.queryKey].value = allValues;
//             }
//         } else if(eachFilter.key !== resultFilter.key && eachFilter.key !== 'question') {
//             if(!apiQuery.query[eachFilter.queryKey] || allValues.indexOf(apiQuery.query[eachFilter.queryKey].value) >= 0) {
//                 apiQuery.query[eachFilter.queryKey] = getFilterQuery(eachFilter);
//                 apiQuery.query[eachFilter.queryKey].value = getValuesByKeyExcludingKeyAndValue(eachFilter.autoCompleteOptions, 'key', 'isAllOption', true);
//             }
//         }
//     });
//     apiQuery.query.primary_filter = getFilterQuery({key: 'primary_filter', queryKey: 'primary_filter', value: resultFilter.queryKey, primary: false});
//     var yearFilter = findByKeyAndValue(primaryFilter.allFilters, 'key', 'year');
//     if(yearFilter.value.length != 1 && !dontAddYearAgg) {
//         headers.columnHeaders.push(yearFilter);
//         apiQuery.aggregations.nested.table.push(getGroupQuery(yearFilter));
//     }
//     result.resultFilter = resultFilter;
//     return result;
// }

/**
 * Finds and returns the first object in array of objects by using the key and value
 * @param a
 * @param key
 * @param value
 * @returns {*}
 */
function findByKeyAndValue(a, key, value) {
    for (var i = 0; i < a.length; i++) {
        if ( a[i][key] && a[i][key] === value ) {return a[i];}
    }
    return null;
}

/**
 * Finds and returns all objects in array of objects that not contains the key and value
 * @param a
 * @param key
 * @param value
 * @returns {Array}
 */
function findAllNotContainsKeyAndValue(a, key, value) {
    var result = [];
    for (var i = 0; i < a.length; i++) {
        if (a[i][key] !== value) {
            result.push(a[i]);
        }
    }
    return result;
}

/**
 * get the array with key
 * @param data
 * @param key
 * @param includeKey
 * @param includeValue
 * @returns {Array}
 */
function getValuesByKeyIncludingKeyAndValue(data, key, includeKey, includeValue) {
    var values = [];
    for (var i = 0; i < data.length; i++) {
        if(data[i][includeKey] === includeValue) {
            values.push(data[i][key]);
        }
    }
    return values;
}

/**
 * get the array with key
 * @param data
 * @param key
 * @returns {Array}
 */
function getValuesByKeyExcludingKeyAndValue(data, key, excludeKey, excludeValue) {
    var values = [];
    for (var i = 0; i < data.length; i++) {
        if(data[i][excludeKey] != excludeValue) {
            values.push(data[i][key]);
        }
    }
    return values;
}


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
    if(primaryFilter.searchFor) {
        apiQuery = primaryFilter;
    }
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
    var result = prepareChartAggregations(headers.rowHeaders.concat(headers.columnHeaders), apiQuery.searchFor);
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
    if(filter.key === 'question' && filter.value.length == 0){
        filter.value = [];
        filter.autoCompleteOptions.forEach( function(q) {
            if(q.qkey.startsWith('qn')) {
                filter.value.push(q.qkey);
            }
        });
        return getFilterQuery(filter);
    }
    else if( isValueNotEmpty(filter.value) && filter.value.length !== getAutoCompleteOptionsLength(filter)) {
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
    //get length when options are nested
    var length = filter.autoCompleteOptions ? filter.autoCompleteOptions.length : 0;
    if(filter.autoCompleteOptions) {
        filter.autoCompleteOptions.forEach(function(option) {
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

function prepareChartAggregations(headers, countKey) {
    var chartHeaders = [];
    var chartAggregations = [];
    headers.forEach( function(eachPrimaryHeader) {
        var primaryGroupQuery = getGroupQuery(eachPrimaryHeader, countKey);
        headers.forEach( function(eachSecondaryHeader) {
            var chartType = chartMappings[eachPrimaryHeader.key + '&' + eachSecondaryHeader.key];
            if(chartType) {
                var secondaryGroupQuery = getGroupQuery(eachSecondaryHeader, countKey);
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
    "gender&placeofdeath": "verticalStack",
    "sex&race": "verticalBar",
    "sex&ethnicity": "verticalBar",
    "sex&agegroup": "horizontalStack",
    "sex&state": "verticalBar",
    "sex&region": "verticalBar",
    "race&ethnicity": "horizontalBar",
    "race&agegroup": "horizontalBar",
    "race&state": "horizontalStack",
    "race&region": "verticalBar",
    "ethnicity&agegroup": "horizontalBar",
    "ethnicity&state": "horizontalStack",
    "ethnicity&region": "verticalBar",
    "agegroup&region": "verticalBar",
    "current_year&sex":"horizontalBar",
    "current_year&race":"horizontalBar",
    "current_year&ethnicity":"horizontalBar",
    "current_year&agegroup":"horizontalBar",
    "current_year&state":"horizontalBar",
    "current_year&region":"verticalBar",
    //natality
    "hispanic_origin&mother_race": "horizontalBar",
    "sex&mother_race": "horizontalBar",
    "hispanic_origin&marital_status": "horizontalBar",
    "mother_race&marital_status": "horizontalBar",
    "mother_race&mother_age": "horizontalBar",
    "hispanic_origin&mother_age": "horizontalBar",
    "marital_status&mother_age": "horizontalBar",
    "mother_race&mother_education": "horizontalBar",
    "hispanic_origin&mother_education": "horizontalBar",
    "marital_status&mother_education": "horizontalBar",
    "mother_age&mother_education": "horizontalBar",
    "dob_yy&marital_status": "horizontalBar",
    "dob_yy&hispanic_origin": "horizontalBar",
    "dob_yy&mother_race": "horizontalBar",
    "dob_yy&mother_age": "horizontalBar",
    "dob_yy&mother_education": "horizontalBar",
    "hispanic_origin&dob_mm": "horizontalBar",
    "mother_race&dob_mm": "horizontalBar",
    "marital_statuc&dob_mm": "horizontalStack",
    "mother_age&dob_mm": "horizontalStack",
    "mother_education&dob_mm": "horizontalStack",
    "dob_yy&dob_mm": "horizontalBar",
    "hispanic_origin&dob_wk": "horizontalStack",
    "mother_race&dob_wk": "horizontalStack",
    "marital_status&dob_wk": "horizontalStack",
    "mother_age&dob_wk": "horizontalStack",
    "mother_education&dob_wk": "horizontalStack",
    "dob_yy&dob_wk": "horizontalStack",
    "dob_mm&dob_wk": "horizontalStack",
    "sex&hispanic_origin": "horizontalStack",
    "sex&marital_status": "horizontalBar",
    "sex&mother_age": "horizontalBar",
    "sex&mother_education": "horizontalBar",
    "dob_yy&sex": "horizontalBar",
    "sex&dob_mm": "horizontalBar",
    "sex&dob_wk": "horizontalBar",
    //insert gestation age here
    "hispanic_origin&prenatal_care": "lineChart",
    "mother_race&prenatal_care": "horizontalBar",
    "marital_status&prenatal_care": "horizontalBar",
    "mother_age&prenatal_care": "horizontalBar",
    "mother_education&prenatal_care": "horizontalBar",
    "dob_yy&prenatal_care": "horizontalBar",
    "dob_mm&prenatal_care": "horizontalBar",
    "dob_wk&prenatal_care": "horizontalBar",
    "sex&prenatal_care": "horizontalBar",

    "hispanic_origin&birth_weight": "horizontalStack",
    "mother_race&birth_weight": "horizontalStack",
    "marital_status&birth_weight": "horizontalStack",
    "mother_age&birth_weight": "horizontalStack",
    "mother_education&birth_weight": "horizontalStack",
    "dob_yy&birth_weight": "horizontalStack",
    "dob_mm&birth_weight": "horizontalStack",
    "dob_wk&birth_weight": "horizontalStack",
    "sex&birth_weight": "horizontalStack",
    "prenatal_care&birth_weight": "horizontalStack",

    "hispanic_origin&birth_plurality": "horizontalStack",
    "mother_race&birth_plurality": "horizontalStack",
    "marital_status&birth_plurality": "horizontalStack",
    "mother_age&birth_plurality": "horizontalStack",
    "mother_education&birth_plurality": "horizontalStack",
    "dob_yy&birth_plurality": "horizontalStack",
    "dob_mm&birth_plurality": "horizontalStack",
    "dob_wk&birth_plurality": "horizontalStack",
    "sex&birth_plurality": "horizontalStack",
    "prenatal_care&birth_plurality": "horizontalStack",
    "birth_weight&birth_plurality": "horizontalStack",

    "hispanic_origin&live_birth": "horizontalStack",
    "mother_race&live_birth": "horizontalStack",
    "marital_status&live_birth": "horizontalStack",
    "mother_age&live_birth": "horizontalStack",
    "mother_education&live_birth": "horizontalStack",
    "dob_yy&live_birth": "horizontalStack",
    "dob_mm&live_birth": "horizontalStack",
    "dob_wk&live_birth": "horizontalStack",
    "sex&live_birth": "horizontalStack",
    "prenatal_care&live_birth": "horizontalStack",
    "birth_weight&live_birth": "horizontalStack",
    "birth_plurality&live_birth": "horizontalStack",

    "hispanic_origin&birth_place": "horizontalStack",
    "mother_race&birth_place": "horizontalStack",
    "marital_status&birth_place": "horizontalStack",
    "mother_age&birth_place": "horizontalStack",
    "mother_education&birth_place": "horizontalStack",
    "dob_yy&birth_place": "horizontalStack",
    "dob_mm&birth_place": "horizontalStack",
    "dob_wk&birth_place": "horizontalStack",
    "sex&birth_place": "horizontalStack",
    "prenatal_care&birth_place": "horizontalStack",
    "birth_weight&birth_place": "horizontalStack",
    "birth_plurality&birth_place": "horizontalStack",
    "live_birth&birth_place": "horizontalStack",

    "hispanic_origin&delivery_method": "horizontalStack",
    "mother_race&delivery_method": "horizontalStack",
    "marital_status&delivery_method": "horizontalStack",
    "mother_age&delivery_method": "horizontalStack",
    "mother_education&delivery_method": "horizontalStack",
    "dob_yy&delivery_method": "horizontalStack",
    "dob_mm&delivery_method": "horizontalStack",
    "dob_wk&delivery_method": "horizontalStack",
    "sex&delivery_method": "horizontalStack",
    "prenatal_care&delivery_method": "horizontalStack",
    "birth_weight&delivery_method": "horizontalStack",
    "birth_plurality&delivery_method": "horizontalStack",
    "birth_place&delivery_method": "horizontalStack",

    "hispanic_origin&medical_attendant": "horizontalStack",
    "mother_race&medical_attendant": "horizontalStack",
    "marital_status&medical_attendant": "horizontalStack",
    "mother_age&medical_attendant": "horizontalStack",
    "mother_education&medical_attendant": "horizontalStack",
    "dob_yy&medical_attendant": "horizontalStack",
    "dob_mm&medical_attendant": "horizontalStack",
    "dob_wk&medical_attendant": "horizontalStack",
    "sex&medical_attendant": "horizontalStack",
    "prenatal_care&medical_attendant": "horizontalStack",
    "birth_weight&medical_attendant": "horizontalStack",
    "birth_plurality&medical_attendant": "horizontalStack",
    "birth_place&medical_attendant": "horizontalStack",
    "delivery_method&medical_attendant": "horizontalStack",

    "hispanic_origin&chronic_hypertension": "horizontalStack",
    "mother_race&chronic_hypertension": "horizontalStack",
    "marital_status&chronic_hypertension": "horizontalStack",
    "mother_age&chronic_hypertension": "horizontalStack",
    "mother_education&chronic_hypertension": "horizontalStack",
    "dob_yy&chronic_hypertension": "horizontalStack",
    "dob_mm&chronic_hypertension": "horizontalStack",
    "dob_wk&chronic_hypertension": "horizontalStack",
    "sex&chronic_hypertension": "horizontalStack",
    "prenatal_care&chronic_hypertension": "horizontalStack",
    "birth_weight&chronic_hypertension": "horizontalStack",
    "birth_plurality&chronic_hypertension": "horizontalStack",
    "birth_place&chronic_hypertension": "verticalStack",
    "delivery_method&chronic_hypertension": "horizontalStack",
    "medical_attendant&chronic_hypertension": "horizontalStack",

    "hispanic_origin&diabetes": "horizontalStack",
    "mother_race&diabetes": "horizontalStack",
    "marital_status&diabetes": "horizontalStack",
    "mother_age&diabetes": "horizontalStack",
    "mother_education&diabetes": "horizontalStack",
    "dob_yy&diabetes": "horizontalStack",
    "dob_mm&diabetes": "horizontalStack",
    "dob_wk&diabetes": "horizontalStack",
    "sex&diabetes": "horizontalStack",
    "prenatal_care&diabetes": "horizontalStack",
    "birth_weight&diabetes": "horizontalStack",
    "birth_plurality&diabetes": "horizontalStack",
    "birth_place&diabetes": "horizontalStack",
    "delivery_method&diabetes": "horizontalStack",
    "medical_attendant&diabetes": "horizontalStack",
    "chronic_hypertension&diabetes": "horizontalStack",

    "hispanic_origin&eclampsia": "horizontalStack",
    "mother_race&eclampsia": "horizontalStack",
    "marital_status&eclampsia": "horizontalStack",
    "mother_age&eclampsia": "horizontalStack",
    "mother_education&eclampsia": "horizontalStack",
    "dob_yy&eclampsia": "horizontalStack",
    "dob_mm&eclampsia": "horizontalStack",
    "dob_wk&eclampsia": "horizontalStack",
    "sex&eclampsia": "horizontalStack",
    "prenatal_care&eclampsia": "horizontalStack",
    "birth_weight&eclampsia": "horizontalStack",
    "birth_plurality&eclampsia": "horizontalStack",
    "birth_place&eclampsia": "horizontalStack",
    "delivery_method&eclampsia": "horizontalStack",
    "medical_attendant&eclampsia": "horizontalStack",
    "chronic_hypertension&eclampsia": "horizontalStack",
    "diabetes&eclampsia": "horizontalStack",

    "hispanic_origin&tobacco_use": "horizontalStack",
    "mother_race&tobacco_use": "horizontalStack",
    "marital_status&tobacco_use": "horizontalStack",
    "mother_age&tobacco_use": "horizontalStack",
    "mother_education&tobacco_use": "horizontalStack",
    "dob_yy&tobacco_use": "horizontalStack",
    "dob_mm&tobacco_use": "horizontalStack",
    "dob_wk&tobacco_use": "horizontalStack",
    "sex&tobacco_use": "horizontalStack",
    "prenatal_care&tobacco_use": "horizontalStack",
    "birth_weight&tobacco_use": "horizontalStack",
    "birth_plurality&tobacco_use": "horizontalStack",
    "birth_place&tobacco_use": "horizontalStack",
    "delivery_method&tobacco_use": "horizontalStack",
    "medical_attendant&tobacco_use": "horizontalStack",
    "chronic_hypertension&tobacco_use": "horizontalStack",
    "diabetes&tobacco_use": "horizontalStack",
    "eclampsia&tobacco_use": "horizontalStack"
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
module.exports.buildAPIQuery = buildAPIQuery;
// module.exports.buildQueryForYRBS = buildQueryForYRBS;
module.exports.addCountsToAutoCompleteOptions = addCountsToAutoCompleteOptions;
