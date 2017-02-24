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
    var filterByYear = {};
    for(var h in hits){
        var filter = hits[h]._source;
        var fname = filter.filter_name;
        var year = filter.year;
        if(!(fname in result)){
            result[fname] = filter.permissible_values;
        } else if (result[fname]){
            // get intersection of PVs
            result[fname] = result[fname].filter(item => filter.permissible_values.indexOf(item) != -1);
        }

        if(!(year in filterByYear)) {
            filterByYear[year] = [fname];
        }else{
            filterByYear[year].push(fname);
        }
    }

    // Remove all filters that are not present in all years
    for (f in result){
        for(y in filterByYear){
            if (filterByYear[y].indexOf(f) < 0){
                delete result[f];
            }
        }
    }

    return result;
}
module.exports = dsmetadata;
