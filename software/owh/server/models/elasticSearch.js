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
var query_data = "queryResults1";


var ElasticClient = function() {

};

ElasticClient.prototype.getClient = function(database) {
    //elastic search client configuration
    return new elasticsearch.Client({
        host: _host+'/'+database
    });
};

ElasticClient.prototype.aggregateDeaths = function(query){
    var client = this.getClient(_index);
    var deferred = Q.defer();
    client.search({
        index:mortality_type,
        body:query,
        request_cache:true
    }).then(function (resp) {
        deferred.resolve(searchUtils.populateDataWithMappings(resp, 'deaths'));
    }, function (err) {
        logger.error(err.message);
        deferred.reject(err);
    });
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

ElasticClient.prototype.getQueryData = function(query){
    var client = this.getClient(_index);
    var deferred = Q.defer();
    client.search({
       index: query_data,
       type: 'object',
       body: query,
       request_cache:true
    }).then(function (resp){
        logger.info("Get queryData successfully completed");
        deferred.resolve(resp);
    }, function(err){
        logger.error("While searching for queryData object ", err.message);
        deferred.reject(err);
    });
    return deferred.promise;
};

ElasticClient.prototype.insertQueryData = function (query) {
    var client = this.getClient(_index);
    var deferred = Q.defer();
    client.create({
        index: query_data,
        body: query
    }).then(function (resp){
        logger.info("inserted new record in queryData");
        deferred.resolve(resp);
    }, function(err){
        logger.error("Failed to insert record in queryData ", err.message);
        deferred.reject(err);
    });
    return deferred.promise;
}
module.exports = ElasticClient;
