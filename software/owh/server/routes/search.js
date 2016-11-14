var result = require('../models/result');
var elasticSearch = require('../models/elasticSearch');
var queryBuilder = require('../api/elasticQueryBuilder');
const util = require('../api/utils');
var wonder = require("../api/wonder");

var searchRouter = function(app, rConfig) {
    app.post('/search', function(req, res) {
        var q = req.body.q;
        var preparedQuery = queryBuilder.buildAPIQuery(q);
        console.log('preparedQuery', JSON.stringify(preparedQuery));
        if ( preparedQuery.apiQuery.searchFor === "deaths" ) {
            var finalQuery = queryBuilder.buildSearchQuery(preparedQuery.apiQuery, true);
            var hashCode = req.body.qID;
            var searchQueryResultsQuery = queryBuilder.buildSearchQueryResultsQuery(hashCode);
            new elasticSearch().getQueryResults(searchQueryResultsQuery).then(function (searchResultsResponse) {
                 if(searchResultsResponse && searchResultsResponse._source.queryID === hashCode && false ) {
                     var resData = {};
                     resData.queryJSON = JSON.parse(searchResultsResponse._source.queryJSON);
                     resData.resultData = JSON.parse(searchResultsResponse._source.resultJSON).data;
                     resData.sideFilterResults = JSON.parse(searchResultsResponse._source.sideFilterResults);
                     res.send( new result('OK', resData, JSON.parse(searchResultsResponse._source.resultJSON).pagination, "success") );
                 }
                 else {
                     var apiQuery = queryBuilder.addCountsToAutoCompleteOptions(q);
                     var finalAPIQuery = queryBuilder.buildSearchQuery(apiQuery, true);
                     new elasticSearch().aggregateDeaths(finalAPIQuery).then(function (sideFilterResults) {
                         new elasticSearch().aggregateDeaths(finalQuery).then(function(response){
                             //grab age adjusted death rates
                             new wonder('D76').invokeWONDER(preparedQuery.apiQuery).then(function(wonderResponse) {
                                 console.log('resp', wonderResponse);
                                 util.mergeAgeAdjustedRates(response.data.nested.table, wonderResponse);
                                 var insertQuery = queryBuilder.buildInsertQueryResultsQuery(JSON.stringify(q), JSON.stringify(response), "Mortality", hashCode, JSON.stringify(sideFilterResults));
                                 new elasticSearch().insertQueryData(insertQuery).then(function(anotherResponse){
                                     var resData = {};
                                     resData.queryJSON = q;
                                     resData.resultData = response.data; //AggregateD
                                     resData.sideFilterResults = sideFilterResults;
                                     res.send( new result('OK', resData, response.pagination, "success") );
                                 }, function(anotherResponse){
                                     res.send( new result('error', anotherResponse, "failed"));
                                 });
                                 // res.send( new result('OK', resp, "success"));
                             });
                         }, function(response){
                             res.send( new result('error', response, "failed"));
                         });
                     });
                     console.log('invoking wonder');
                     // new wonder('D76').invokeWONDER(preparedQuery.apiQuery).then(function(resp) {
                     //     console.log('resp', resp);
                     //     res.send( new result('OK', resp, "success"));
                     // });

                 }
            });

        } else if ( preparedQuery.apiQuery.searchFor === "mental_health" ) {
            var yrbsPreparedQuery = queryBuilder.buildQueryForYRBS(q);
            yrbsPreparedQuery['pagination'] = {from: 0, size: 10000};
            yrbsPreparedQuery.apiQuery['pagination'] = {from: 0, size: 10000};
            var finalQuery = queryBuilder.buildSearchQuery(yrbsPreparedQuery.apiQuery, false);
            /*finalQuery.sort = [
                { "percent" : {"order" : "desc"}},
                "_score"
            ];*/
            new elasticSearch().aggregateMentalHealth(finalQuery[0], yrbsPreparedQuery.apiQuery.dataKeys, yrbsPreparedQuery.apiQuery.aggregations.nested.table).then(function(response){
                res.send( new result('OK', response, response.pagination, "success") );
            }, function(response){
                res.send( new result('error', response, "failed"));
            });
        }
    });
};

module.exports = searchRouter;
