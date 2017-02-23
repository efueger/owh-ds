var result = require('../models/result');
var elasticSearch = require('../models/elasticSearch');

//**

var dsmetadata = function(app, rConfig) {
    app.get('/dsmetadata/:dataset', function(req, res) {
        var dataset = req.params.dataset
        var years = req.query.years?req.query.years.split(','):[];
        new elasticSearch().getDsMetadata(dataset, years).then( function (resp) {
            var r = processQueryResponse(resp);
            res.send( new result('OK', r, "success") );
        }, function (err) {
            res.send(new result('Error retrieving dataset metadata', err, "failed"));
        });
    });
}

/**
 * Process the result and created a combined filter -pv list for all the selected years
 * Returns a result of the form
 *  {'race':['Asian', 'White'], 'ethnicity':['Hispanic', Not Hispanic], 'age': null}
 * @param esResp
 */
function  processQueryResponse(esResp) {
    var hits = esResp.hits.hits;
    var result = {};
    for(var h in hits){
        var filter = hits[h]._source;
        var fname = filter.filter_name;
        if(!(fname in result)){
            result[fname] = filter.permissible_values;
        } else {
            var currpvs = result[fname];
            // merge the pvs on the filter to the current pvs
            for (pv in filter.permissible_values) {
                if (currpvs.indexOf(filter.permissible_values[pv]) < 0) {
                    currpvs.push(filter.permissible_values[pv]);
                }
            }
        }
    }
    return result;
}
module.exports = dsmetadata;
