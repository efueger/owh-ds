var elasticsearch = require('elasticsearch');
var searchUtils = require('../api/utils');
var elasticQueryBuilder = require('../api/elasticQueryBuilder');
const util = require('util');
var wonder = require("../api/wonder");
var Q = require('q');
var logger = require('../config/logging');
var config = require('../config/config');
var _host = config.elastic_search.url;
var _index= "owh";
var mortality_index = "owh_mortality";
var mortality_type = "mortality";
var natality_index = "owh_natality";
var natality_type = "natality";
var census_index="owh_census";
var census_rates_index="owh_census_rates";
var census_type="census";
var census_rates_type="census_rates";
//@TODO to work with my local ES DB I changed mapping name to 'queryResults1', revert before check in to 'queryResults'
var _queryIndex = "owh_querycache";
var _queryType = "queryData";
var mental_health_type = "yrbs";
var dsmetadata_index = "owh_dsmetadata";
var dsmetadata_type = "dsmetadata";

var ElasticClient = function() {

};

ElasticClient.prototype.getClient = function(database) {
    //elastic search client configuration
    /*return new elasticsearch.Client({
        host: _host+'/'+database
    });*/

     var configuration = {};
     configuration.apiVersion = '1.5';
    /* configuration.log = [{
     type: 'stdio',
     levels: ['info', 'debug', 'error', 'warning']
     }];*/
    if(database) {
        configuration.host = _host + '/' + database;
    }
    else {
        configuration.host = _host;
    }
    //elastic search client configuration
    return new elasticsearch.Client(configuration);

};

ElasticClient.prototype.aggregateCensusDataForMortalityQuery = function(query, index, type){
    var deferred = Q.defer();
    this.executeESQuery(index, type, query).then(function (resp) {
        deferred.resolve(searchUtils.populateDataWithMappings(resp, 'pop'));
    });
    return deferred.promise;
};

ElasticClient.prototype.executeESQuery = function(index, type, query){
    var client = this.getClient(index);
    var deferred = Q.defer();
    client.search({
        index:type,
        body:query,
        request_cache:true
    }).then(function (resp) {
        deferred.resolve(resp);
    }, function (err) {
        logger.error(err.message);
        deferred.reject(err);
    });

    return deferred.promise;
};


ElasticClient.prototype.executeMortilyAndNatalityQueries = function(query, index, type){
    var deferred = Q.defer();
    var queryPromises = [];
    var aggrs = query.aggregations;
    for (var aggr in aggrs){
        var newQ = {size: 0, query: query.query, aggregations:{}};
        newQ.aggregations[aggr] = aggrs[aggr];
        var p = this.executeESQuery(index, type, newQ);
        queryPromises.push(p);
    }

    Q.all(queryPromises).then(function(resp){
        var mergedResult = resp[0];
        for (var i =1; i< resp.length; i++){
            for (var key in resp[i].aggregations){
                mergedResult.aggregations[key] = resp[i].aggregations[key];
            }
        }
        deferred.resolve(mergedResult);
    });

    return deferred.promise;
};

ElasticClient.prototype.mergeWithCensusData = function(data, censusData){
    mergeCensusRecursively(data.data.nested.table, censusData.data.nested.table);
};

function mergeCensusRecursively(mort, census) {
    // sort arrays by name, before merging, so that the values for the matching
    var sortFn = function (a, b){
        if (a.name > b.name) { return 1; }
        if (a.name < b.name) { return -1; }
        return 0;
    };

    if (Array.isArray(mort)){
        mort.sort(sortFn);
    }

    if (Array.isArray(census)){
        census.sort(sortFn);
    }

    if(census && census.pop && typeof census.pop === 'number') {
        mort.pop = census.pop;
    }
    if(typeof mort === 'string' || typeof mort === 'number') {
        return;
    }

    if(census) {
        for (var prop in mort) {
            if(!mort.hasOwnProperty(prop)) continue;
            mergeCensusRecursively(mort[prop], census[prop]);
        }
    }
}


ElasticClient.prototype.aggregateDeaths = function(query, isStateSelected){
    var self = this;
    var client = this.getClient(mortality_index);
    var deferred = Q.defer();
    if(query[1]){
        logger.debug("Mortality ES Query: "+ JSON.stringify( query[0]));
        logger.debug("Census ES Query: "+ JSON.stringify( query[1]));
        var promises = [
            this.executeMortilyAndNatalityQueries(query[0], mortality_index, mortality_type),
            this.aggregateCensusDataForMortalityQuery(query[1], census_rates_index, census_rates_type)
        ];
        if(query.wonderQuery) {
            promises.push(new wonder('D76').invokeWONDER(query.wonderQuery))
        }
        Q.all(promises).then( function (resp) {
            var data = searchUtils.populateDataWithMappings(resp[0], 'deaths');
            self.mergeWithCensusData(data, resp[1]);
            searchUtils.mergeAgeAdjustedRates(data.data.nested.table, resp[2]);

            if (isStateSelected) {
                searchUtils.applySuppressions(data, 'deaths');
            }

            deferred.resolve(data);
        }, function (err) {
            logger.error(err.message);
            deferred.reject(err);
        });
    }
    else {
        logger.debug("Mortality ES Query: "+ JSON.stringify( query[0]));
        this.executeESQuery(mortality_index, mortality_type,query[0]).then(function (resp) {
            var data = searchUtils.populateDataWithMappings(resp, 'deaths');
            deferred.resolve(data);
        }, function (err) {
            logger.error(err.message);
            deferred.reject(err);
        });
    }
    return deferred.promise;
};

/**
 * This method is used to get the bridge race data(census) based on passed in query
 */
ElasticClient.prototype.aggregateCensusData = function(query, isStateSelected){
    //get tge elasic search client for census index
    var client = this.getClient(census_index);
    var deferred = Q.defer();
    //execute the search query
    client.search({
        index:census_type,
        body:query,
        request_cache:true
    }).then(function (resp) {
        //parse the search results
        var results = searchUtils.populateDataWithMappings(resp, 'bridge_race', 'pop');
        if (isStateSelected) {
            searchUtils.applySuppressions(results, 'bridge_race');
        }
        deferred.resolve(results);
    }, function (err) {
        logger.error(err.message);
        deferred.reject(err);
    });
    return deferred.promise;
};

/**
 * This method is used to fetch the natality data
 */
ElasticClient.prototype.aggregateNatalityData = function(query){
    //get tge elastic search client for natality index
    var self = this;
    var client = this.getClient(natality_index);
    var deferred = Q.defer();
    if(query[1]) {
        logger.debug("Natality ES Query: "+ JSON.stringify( query[0]));
        logger.debug("Census Rates ES Query: "+ JSON.stringify( query[1]));
        var promises = [
            this.executeMortilyAndNatalityQueries(query[0], natality_index, natality_type),
            this.aggregateCensusDataForMortalityQuery(query[1], census_rates_index, census_rates_type)
        ];
        Q.all(promises).then( function (resp) {

            var data = searchUtils.populateDataWithMappings(resp[0], 'natality');
            self.mergeWithCensusData(data, resp[1]);
            deferred.resolve(data);
        }, function (err) {
            logger.error(err.message);
            deferred.reject(err);
        });
    }
    else {
        logger.debug("Natality ES Query: "+ JSON.stringify( query[0]));
        this.executeESQuery(natality_index, natality_type, query[0]).then(function (resp) {;
            var data = searchUtils.populateDataWithMappings(resp, 'natality');
            deferred.resolve(data);
        }, function (err) {
            logger.error(err.message);
            deferred.reject(err);
        });
    }
    return deferred.promise;
};

ElasticClient.prototype.getQueryCache = function(query){
    var client = this.getClient(_queryIndex);
    var deferred = Q.defer();

    client.search({
       index: _queryType,
       body: query,
       request_cache:true
    }).then(function (resp){
        if(resp.hits.hits.length > 0) {
            deferred.resolve(resp.hits.hits[0])
        }else{
            deferred.resolve(null);
        }
    }, function(err){
        logger.error("While searching for queryData object ", err.message);
        deferred.reject(err);
    });
    return deferred.promise;
};


/**
 *
 * @param query
 * @returns {*}
 */
ElasticClient.prototype.insertQueryData = function (query) {
    var client = this.getClient();
    var deferred = Q.defer();
    client.create({
        index: _queryIndex,
        type: _queryType,
        body: query
    }).then(function (resp){
        deferred.resolve(resp);
    }, function(err){
        logger.error("Failed to insert record in queryResults ", err.message);
        deferred.reject(err);
    });
    return deferred.promise;
};

/**
 * Retrieve data set metadata for the given dataset and year
 * @param dataset
 * @param years
 * @returns {*|promise}
 */
ElasticClient.prototype.getDsMetadata = function (dataset, years) {
    var query = {"size": 1000,"filter":{"and":{"filters":[{"term":{"dataset":dataset}}]}}};
    if (years && years.length > 0){
        var yearfilter = [];
        for (var year in years) {
            yearfilter.push({"term": {"year": years[year]}});
        }
        query.filter.and.filters.push({"or": yearfilter});
    }

    var client = this.getClient();
    var deferred = Q.defer();
    client.search({
        index: dsmetadata_index,
        type: dsmetadata_type,
        body: query
    }).then(function (resp){
        deferred.resolve(resp);
    }, function(err){
        logger.error("Failed to retrieve ds metadata ", err.message);
        deferred.reject(err);
    });
    return deferred.promise;
};


module.exports = ElasticClient;
