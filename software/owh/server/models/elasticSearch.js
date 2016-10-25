var elasticsearch = require('elasticsearch');
var searchUtils = require('../api/utils');
var elasticQueryBuilder = require('../api/elasticQueryBuilder');
const util = require('util');
var Q = require('q');
var logger = require('../config/logging')
var config = require('../config/config')
var _host = config.elastic_search.url
var _index = "owh";
//var _mortality_index = "mortality";
var mortality_type = "mortality";
//var mortality_type = "deaths";
var mental_health_type = "yrbs";
var census_index="census";
var census_type="census";
//@TODO to work with my local ES DB I changed mapping name to 'queryResults1', revert before check in to 'queryResults'
var query_data = "queryResults1";


var ElasticClient = function() {

};

ElasticClient.prototype.getClient = function(database) {
    //elastic search client configuration
    return new elasticsearch.Client({
        host: _host+'/'+database
    });
};

ElasticClient.prototype.aggregateCensusDataForMortalityQuery = function(query){
    var client = this.getClient(census_index);
    var deferred = Q.defer();
    client.search({
        index:census_type,
        body:query,
        request_cache:true
    }).then(function (resp) {
        deferred.resolve(searchUtils.populateDataWithMappings(resp, 'pop'));
    }, function (err) {
        logger.error(err.message);
        deferred.reject(err);
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

    for (var prop in mort) {
        if(!mort.hasOwnProperty(prop)) continue;
        mergeCensusRecursively(mort[prop], census[prop]);
    }
}


ElasticClient.prototype.aggregateDeaths = function(query){
    var self = this;
    var client = this.getClient(_index);
    var deferred = Q.defer();
    if(query[1]){
        this.aggregateCensusDataForMortalityQuery(query[1]).then(function(censusData) {
            client.search({
                index:mortality_type,
                body:query[0],
                request_cache:true
            }).then(function (resp) {
                var data = searchUtils.populateDataWithMappings(resp, 'deaths');
                self.mergeWithCensusData(data, censusData);
                deferred.resolve(data);
            }, function (err) {
                logger.error(err.message);
                deferred.reject(err);
            });
        }, function(err) {
            logger.error(err.message);
            deferred.reject(err);
        });
    }
    else {
        client.search({
            index:mortality_type,
            body:query[0],
            request_cache:true
        }).then(function (resp) {
            var data = searchUtils.populateDataWithMappings(resp, 'deaths');
            deferred.resolve(data);
        }, function (err) {
            logger.error(err.message);
            deferred.reject(err);
        });
    }
    return deferred.promise;
};



ElasticClient.prototype.aggregateMentalHealth = function(query, headers, aggregations){
    var client = this.getClient(_index);
    var deferred = Q.defer();
    client.search({
        index:mental_health_type,
        body:query,
        request_cache:true
    }).then(function (resp) {
        deferred.resolve(searchUtils.populateYRBSData(resp.hits.hits, headers, aggregations))
    }, function (err) {
        logger.error(err.message);
        deferred.reject(err);
    });
    return deferred.promise;
};

ElasticClient.prototype.getQueryResults = function(query){
    var client = this.getClient(_index);
    var deferred = Q.defer();
    client.search({
       index: query_data,
       body: query,
       request_cache:true
    }).then(function (resp){
        logger.info("Get queryData successfully completed");
        var results = resp.hits.hits.length > 0 ? resp.hits.hits[0]:[] ;
        deferred.resolve(results);
    }, function(err){
        console.log(" getqueryresults query not completed ***************************************** ", err.message);
        logger.error("While searching for queryData object ", err.message);
        deferred.reject(err);
    });
    return deferred.promise;
};


//@TODO: @Gopal this is the JSON that used to create elasticsearch mapping
//for now I created manually using chrome 'Postman' plugin in my local ES DB
//How are we planning to create this mapping?
/*
{
    "queryResults": {
    "properties" : {
        "queryJSON" : {
            "type": "object"
        },
        "dataset" : {
            "type": "string",
                "index": "not_analyzed"
        },
        "queryID" : {
            "type": "string",
            "index": "not_analyzed"
        },
        "lastupdated" : {
            "type": "date",
            "index": "not_analyzed"
        },
        "resultJSON" : {
            "type": "object"
        }
    }
}
}
*/

ElasticClient.prototype.insertQueryData = function (query) {
    var client = this.getClient(_index);
    var deferred = Q.defer();
    client.create({
        index: query_data,
        type: "object",
        body: query
    }).then(function (resp){
        logger.info("inserted new record in queryData");
        deferred.resolve(resp);
    }, function(err){
        logger.error("Failed to insert record in queryResults ", err.message);
        deferred.reject(err);
    });
    return deferred.promise;
}
module.exports = ElasticClient;
