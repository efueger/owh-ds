var result = require('../models/result');
var elasticSearch = require('../models/elasticSearch');
var queryBuilder = require('../api/elasticQueryBuilder');
const util = require('util');

var searchRouter = function(app, rConfig) {
    app.post('/search', function(req, res) {
        var q = req.body.q;
        var preparedQuery = queryBuilder.buildAPIQuery(q);
        if ( preparedQuery.apiQuery.searchFor === "deaths" ) {
           // console.log("Querying deaths", q);

            var finalQuery = queryBuilder.buildSearchQuery(preparedQuery.apiQuery, true);
            var hashCode = req.body.qID;
            var searchQueryResultsQuery = queryBuilder.buildSearchQueryResultsQuery(hashCode);
            //if queryID exists and it has results
            //then return results
          //  console.log("*********************************************************** getqueryresults ********************** ", q.rawQuery);
            new elasticSearch().getQueryResults(searchQueryResultsQuery).then(function (searchResultsResponse) {
                 if(searchResultsResponse && searchResultsResponse._source.queryID === hashCode ) {
                     var resData = {};
                     resData.queryJSON = searchResultsResponse._source.queryJSON;
                     resData.resultData = searchResultsResponse._source.resultJSON.data;
                     res.send( new result('OK', resData, searchResultsResponse._source.resultJSON.pagination, "success") );
                 }
                 else {
                     new elasticSearch().aggregateDeaths(finalQuery).then(function(response){
                        // var aggregateResponse = response;
                         var insertQuery = queryBuilder.buildInsertQueryResultsQuery(q, response, "Mortality", hashCode);
                         new elasticSearch().insertQueryData(insertQuery).then(function(anotherResponse){
                             var resData = {};
                             resData.queryJSON = q;
                             resData.resultData = response.data; //AggregateD
                             res.send( new result('OK', resData, response.pagination, "success") );
                         }, function(anotherResponse){
                             res.send( new result('error', anotherResponse, "failed"));
                         });
                     }, function(response){
                         res.send( new result('error', response, "failed"));
                     });
                 }
            });
           /* new elasticSearch().aggregateDeaths(finalQuery).then(function(response){
                console.log(" searchhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhh ");
                res.send( new result('OK', response.data, response.pagination, "success") );
            });*/

        } else if ( preparedQuery.apiQuery.searchFor === "mental_health" ) {
            q['pagination'] = {from: 0, size: 10000};
            var finalQuery = queryBuilder.buildSearchQuery(preparedQuery.apiQuery, false);
            /*finalQuery.sort = [
                { "percent" : {"order" : "desc"}},
                "_score"
            ];*/
            console.log(JSON.stringify(finalQuery));
            new elasticSearch().aggregateMentalHealth(finalQuery[0], preparedQuery.apiQuery.dataKeys, preparedQuery.apiQuery.aggregations.nested.table).then(function(response){
                res.send( new result('OK', response, response.pagination, "success") );
            }, function(response){
                res.send( new result('error', response, "failed"));
            });
        }
    });

    app.get('/search', function(req, res){
        console.log(" Search get request ", req.body.q);
        res.send( new result('OK', "data", "pagination", "success") );
    });
};

module.exports = searchRouter;
