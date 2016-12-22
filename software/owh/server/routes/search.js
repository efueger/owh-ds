var result = require('../models/result');
var elasticSearch = require('../models/elasticSearch');
var queryBuilder = require('../api/elasticQueryBuilder');
var wonder = require("../api/wonder");
var yrbs = require("../api/yrbs");
var searchUtils = require('../api/utils');
var logger = require('../config/logging')
var qc = require('../api/queryCache');
var Q = require('q');

var queryCache = new qc();

var searchRouter = function(app, rConfig) {
    app.post('/search', function (req, res) {
        var q = req.body.q;
        logger.debug("Incoming RAW query: ", JSON.stringify(q));
        var queryId = req.body.qID;
        if (queryId) {
            queryCache.getCachedQuery(queryId).then(function (r) {
                if(r) {
                    logger.info("Retrieved query results for query ID " + queryId + " from query cache");
                    var resData = {};
                    resData.queryJSON = JSON.parse(r._source.queryJSON);
                    resData.resultData = JSON.parse(r._source.resultJSON);
                    resData.sideFilterResults = JSON.parse(r._source.sideFilterResults);
                    res.send(new result('OK', resData, "success"));
                }else{
                    logger.info("Query with ID " + queryId + " not in cache, executing query");
                    if (q) {
                        res.connection.setTimeout(0); // To avoid the post callback being called multiple times when the search method takes long time
                        search(q).then(function (resp) {
                            queryCache.cacheQuery(queryId, q.key, resp);
                            res.send(new result('OK', resp, "success"));
                        }, function (err) {
                            res.send(new result('Error executing query', err, "failed"));
                        });
                    } else {
                        res.send(new result('No query data present in request, unable to run query', q , "failed"));
                    }
                }
            });
        } else {
            logger.warn('Query ID not present, query failed');
            res.send(new result('Query ID not present', null, "failed"));
        }
    });
};


function search(q) {
    var deferred = Q.defer();
    var preparedQuery = queryBuilder.buildAPIQuery(q);
    logger.debug("Incoming query: ", JSON.stringify(preparedQuery));
    if (preparedQuery.apiQuery.searchFor === "deaths") {
        var finalQuery = queryBuilder.buildSearchQuery(preparedQuery.apiQuery, true);
        var sideFilterQuery = queryBuilder.buildSearchQuery(queryBuilder.addCountsToAutoCompleteOptions(q), true);
        finalQuery.wonderQuery = preparedQuery.apiQuery;
        new elasticSearch().aggregateDeaths(sideFilterQuery).then(function (sideFilterResults) {
            new elasticSearch().aggregateDeaths(finalQuery).then(function (response) {
                searchUtils.suppressSideFilterTotals(sideFilterResults.data.simple, response.data.nested.table);
                var resData = {};
                resData.queryJSON = q;
                resData.resultData = response.data;
                resData.sideFilterResults = sideFilterResults;
                deferred.resolve(resData);
            });
        });
    } else if (preparedQuery.apiQuery.searchFor === "mental_health") {
        preparedQuery['pagination'] = {from: 0, size: 10000};
        preparedQuery.apiQuery['pagination'] = {from: 0, size: 10000};
        new yrbs().invokeYRBSService(preparedQuery.apiQuery).then(function (response) {
            var resData = {};
            resData.queryJSON = q;
            resData.resultData = response;
            resData.sideFilterResults = [];
            deferred.resolve(resData);
        });
    } else if (preparedQuery.apiQuery.searchFor === "bridge_race") {
        var finalQuery = queryBuilder.buildSearchQuery(preparedQuery.apiQuery, true);
        new elasticSearch().aggregateCensusData(finalQuery[0]).then(function (response) {
            var resData = {};
            resData.queryJSON = q;
            resData.resultData = response.data;
            resData.resultData.headers = preparedQuery.headers;
            resData.sideFilterResults = [];
            deferred.resolve(resData);
        });
    }
    return  deferred.promise;
};

module.exports = searchRouter;

