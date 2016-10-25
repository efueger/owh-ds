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
            var hashCode = req.body.qID; //util.generateHashCode(finalQuery);
            var getQuery = { "queryID" : hashCode };
            //if queryID exists and it has results
            //then return results
            /*new elasticSearch().getQueryData(getQuery).then(function (resp) {
                console.log(" get query data response ", resp);
                 if(resp.data.length > 0) {
                     res.send( new result('OK', resp.data, resp.pagination, "success") );
                 }
            });*/

            //if queryID doesn't exists in QueryData OR results empty

            //console.log(JSON.stringify(finalQuery));
            var response = null;
            new elasticSearch().aggregateDeaths(finalQuery).then(function(response){
                response = resp;
                // res.send( new result('OK', response.data, response.pagination, "success") );
            }, function(response){
                res.send( new result('error', response, "failed"));
            });
            var insertQuery = {};
            insertQuery.queryID = hashCode.toString();
            insertQuery.dataset = "Mortality";
            insertQuery.lastupdated1 = "2016-06-06";
            insertQuery.resultJSON1 = response;
            insertQuery.queryJSON1 = finalQuery;
            new elasticSearch().insertQueryData(insertQuery);
            response.send( new result('OK', response.data, response.pagination, "success") );
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
