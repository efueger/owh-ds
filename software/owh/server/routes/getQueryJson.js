var logger = require('../config/logging')
var result = require('../models/result');
var qc = require('../api/queryCache');
var queryCache = new qc();

var getQueryJsonRouter = function(app, rConfig) {
    app.get('/getQueryJson/:queryId', function(req, res) {
        console.log("*****************************************************************************************************************************************");
        var queryId = req.params.queryId;
        queryCache.getCachedQuery(queryId).then(function (r) {

            if (r) {
                logger.info("******************************** Retrieved query results for query ID " + queryId + " from query cache");
                var resData = {};
                resData.queryJSON = JSON.parse(r._source.queryJSON);
                //resData.resultData = JSON.parse(r._source.resultJSON);
                //resData.sideFilterResults = JSON.parse(r._source.sideFilterResults);
                res.send(new result('OK', resData, "success"));
            }
            else {
                logger.info("Query with ID " + queryId + " not in cache, executing query");
                res.send(new result('No query data present in request'));
            }
        });
    });
};
module.exports = getQueryJsonRouter;
