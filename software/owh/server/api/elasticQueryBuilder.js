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

module.exports.prepareAggregationQuery = prepareAggregationQuery;
module.exports.buildSearchQuery = buildSearchQuery;
module.exports.isEmptyObject = isEmptyObject;
