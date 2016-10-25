var result = require('../models/result');
var elasticSearch = require('../models/elasticSearch');
var queryBuilder = require('../api/elasticQueryBuilder');
const util = require('util');

var searchRouter = function(app, rConfig) {
    app.post('/search', function(req, res) {
        var q = req.body.q;
        if ( q.searchFor === "deaths" ) {
            console.log("Querying deaths");
            var finalQuery = queryBuilder.buildSearchQuery(q, true);
            var hashCode = req.body.qID;
            var searchQueryResultsQuery = queryBuilder.buildSearchQueryResultsQuery(hashCode);
            //if queryID exists and it has results
            //then return results
            new elasticSearch().getQueryResults(searchQueryResultsQuery).then(function (searchResultsResponse) {
                 if(searchResultsResponse.length > 0  && searchResultsResponse._source.queryID === hashCode ) {
                     //@TODO change resultsJSON1 to resultJSON
                     res.send( new result('OK', searchResultsResponse._source.resultJSON1.data, searchResultsResponse._source.resultJSON1.pagination, "success") );
                 }
                 else {
                     new elasticSearch().aggregateDeaths(finalQuery).then(function(response){
                         var aggreageDeathsResponse = response;
                         var insertQuery = queryBuilder.buildInsertQueryResultsQuery(finalQuery, response, "Mortality", hashCode);
                         //@TODO When I try to insert new record, getting document_already_exists_exception, looking into it.
                         new elasticSearch().insertQueryData(insertQuery).then(function(anotherResponse){
                             res.send( new result('OK', aggreageDeathsResponse.data, aggreageDeathsResponse.pagination, "success") );
                         }, function(anotherResponse){
                             res.send( new result('error', anotherResponse, "failed"));
                         });
                     }, function(response){
                         res.send( new result('error', response, "failed"));
                     });
                 }
            });
            //res.send( new result('OK', capturedResponse.data, capturedResponse.pagination, "success") );
        } else if ( q.searchFor === "mental_health" ) {
            q['pagination'] = {from: 0, size: 10000};
            var finalQuery = queryBuilder.buildSearchQuery(q, false);
            /*finalQuery.sort = [
                { "percent" : {"order" : "desc"}},
                "_score"
            ];*/
            console.log(JSON.stringify(finalQuery));
            new elasticSearch().aggregateMentalHealth(finalQuery[0], q.dataKeys, q.aggregations.nested.table).then(function(response){
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
