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
            //console.log(JSON.stringify(finalQuery));
            new elasticSearch().aggregateDeaths(finalQuery).then(function(response){
                res.send( new result('OK', response.data, response.pagination, "success") );
            });
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
            });
        }
    });
};

module.exports = searchRouter;