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


var ElasticClient = function() {

};

ElasticClient.prototype.getClient = function(database) {
    //elastic search client configuration
    return new elasticsearch.Client({
        host: _host+'/'+database
    });
};

ElasticClient.prototype.aggregateCensusDataForMortalityQuery = function(query){
    // console.log('aggregate census------------------------------', JSON.stringify(query));
    var client = this.getClient(census_index);
    var deferred = Q.defer();
    client.search({
        index:census_type,
        body:query,
        request_cache:true
    }).then(function (resp) {
        // console.log('census resp----------------------------------', JSON.stringify(searchUtils.populateDataWithMappings(resp, 'pop')));
        deferred.resolve(searchUtils.populateDataWithMappings(resp, 'pop'));
    }, function (err) {
        logger.error(err.message);
        deferred.reject(err);
    });

    return deferred.promise;
};

function mergeWithCensusData(data, censusData) {
    console.log('merge------------------------------------------');
    console.log('mort data', JSON.stringify(data));
    console.log('census data', JSON.stringify(censusData));
    mergeCensusRecursively(data.data.nested.table, censusData.data.nested.table);
}

function mergeCensusRecursively(mort, census) {
  // console.log('merge recursively-----------------------------------');
  // console.log('mort', mort);
  // console.log('census', census);
  if(census && census.pop && typeof census.pop === 'number') {
      // console.log('census pop', census.pop);
      mort.pop = census.pop;
      // console.log('modified mort data-------------------------------------', mort);
  }
  if(typeof mort === 'string' || typeof mort === 'number') {
      return;
  }
  for (var prop in mort) {
      // console.log('loop', mort[prop]);
      // console.log('property check', mort.hasOwnProperty(prop));
      if(!mort.hasOwnProperty(prop)) continue;
      mergeCensusRecursively(mort[prop], census[prop]);
  }
}


ElasticClient.prototype.aggregateDeaths = function(query){
    var client = this.getClient(_index);
    var deferred = Q.defer();
    if(query[1]){
        this.aggregateCensusDataForMortalityQuery(query[1]).then(function(censusData) {
            // console.log('census promise resp--------------------------------------', censusData);
            client.search({
                index:mortality_type,
                body:query[0],
                request_cache:true
            }).then(function (resp) {
                var data = searchUtils.populateDataWithMappings(resp, 'deaths');
                // console.log('mort data-----------------------------', JSON.stringify(data));
                mergeWithCensusData(data, censusData);
                // console.log('promise resolved-------------------------------------------------------');
                deferred.resolve(data);
            }, function (err) {
                logger.error(err.message);
                deferred.reject(err);
            });
        });
    }
    else {
        client.search({
            index:mortality_type,
            body:query[0],
            request_cache:true
        }).then(function (resp) {
            var data = searchUtils.populateDataWithMappings(resp, 'deaths');
            // console.log('data-----------------------------', JSON.stringify(data));
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

module.exports = ElasticClient;
