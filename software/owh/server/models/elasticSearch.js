var elasticsearch = require('elasticsearch');
var searchUtils = require('../api/utils');
var elasticQueryBuilder = require('../api/elasticQueryBuilder');
const util = require('util');
var Q = require('q');

//var _host = "http://192.168.2.21:9200/";
var _host = "https://search-spl-neoxainmajvric7meirttqquqy.us-east-1.es.amazonaws.com/";
var _index = "owh";
//var _mortality_index = "mortality";
var mortality_type = "mortality";
//var mortality_type = "deaths";
var mental_health_type = "yrbs";


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
        console.trace(err.message);
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
        console.trace(err.message);
        deferred.reject(err);
    });
    return deferred.promise;
};

module.exports = ElasticClient;