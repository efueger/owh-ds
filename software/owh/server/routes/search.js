var result = require('../models/result');
var elasticSearch = require('../models/elasticSearch');
var queryBuilder = require('../api/elasticQueryBuilder');
const util = require('util');

var searchRouter = function(app, rConfig) {
    app.post('/search', function(req, res) {
        var q = req.body.q;
        var preparedQuery = queryBuilder.buildAPIQuery(q);
        if ( preparedQuery.apiQuery.searchFor === "deaths" ) {
            var finalQuery = queryBuilder.buildSearchQuery(preparedQuery.apiQuery, true);
            var hashCode = req.body.qID;
            var searchQueryResultsQuery = queryBuilder.buildSearchQueryResultsQuery(hashCode);
            new elasticSearch().getQueryResults(searchQueryResultsQuery).then(function (searchResultsResponse) {
                 if(searchResultsResponse && searchResultsResponse._source.queryID === hashCode ) {
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
                         }, function(response){
                             res.send( new result('error', response, "failed"));
                         });
                     });

                 }
            });

        } else if ( preparedQuery.apiQuery.searchFor === "mental_health" ) {
            q['pagination'] = {from: 0, size: 10000};
            preparedQuery.apiQuery['pagination'] = {from: 0, size: 10000};
            var finalQuery = queryBuilder.buildSearchQuery(preparedQuery.apiQuery, false);
            /*finalQuery.sort = [
                { "percent" : {"order" : "desc"}},
                "_score"
            ];*/
            new elasticSearch().aggregateMentalHealth(finalQuery[0], preparedQuery.apiQuery.dataKeys, preparedQuery.apiQuery.aggregations.nested.table).then(function(response){
                res.send( new result('OK', response, response.pagination, "success") );
            }, function(response){
                res.send( new result('error', response, "failed"));
            });
        }
    });
};

module.exports = searchRouter;
