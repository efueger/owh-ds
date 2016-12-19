var Q = require('q');
var logger = require('../config/logging')
var config = require('../config/config')
var request = require('request');

function yrbs() {
}

/**
 * Invoke YRBS service for each selected question, merge the results and return a single result in the form
 * {"table":{"question":[{"name":"question 1","mental_health":"0.8136<br><br/><nobr>(0.7696-0.8508)</nobr><br/>8757",
                         "q2":[{"name:"Male", "mental_health":"0.8136<br><br/><nobr>(0.7696-0.8508)</nobr><br/>8757", "grade":[{name, mental_health: },...]},
 *                             {"name:"Female", "mental_health":"0.8136<br><br/><nobr>(0.7696-0.8508)</nobr><br/>8757", "grade":[{name, mental_health: },...]}
 * }
 * YRBS service currently takes only one question per invocation, so multiple parallel invocations are made for each question selected by the user
 * and the results are merges to form a single response
 * @param apiQuery
 * @returns {*}
 */
yrbs.prototype.invokeYRBSService = function(apiQuery){
    var self = this;
    var yrbsquery = this.buildYRBSQueries(apiQuery);
    var deferred = Q.defer();
    var queryPromises = [];
    logger.info("Invoking YRBS service for "+yrbsquery.length+" questions");
    for (var q in yrbsquery){
        queryPromises.push(invokeYRBS(config.yrbs.url+ '?'+yrbsquery[q]));
    }
    Q.all(queryPromises).then(function(resp){
        logger.info("YRBS service response received for all "+yrbsquery.length+" questions");
        deferred.resolve(self.processYRBSReponses(resp));
    }, function (error) {
        deferred.reject(error);
    });

    return deferred.promise;
};

/**
 * Build query for YRBS service.
 * YRBS service takes only one question at a time, so this method builds one query per each question selected
 * and return an array of query string for YRBS service call
 */
yrbs.prototype.buildYRBSQueries = function (apiQuery){
    var queries = [];

    var aggrsKeys  = [];
    for (var i = 0; i<apiQuery.aggregations.nested.table.length; i++ ){
        var agg = apiQuery.aggregations.nested.table[i];
        if (agg.queryKey != 'question.key'){
            aggrsKeys.push(agg.queryKey);
        }
    }


    // Grouping needs to be always in the following order Sex (sex), Grade (grade) and Race (race7)
    var sortedKeys = [];
    if('sex' in aggrsKeys){
        sortedKeys.push('sex');
    }
    if('grade' in aggrsKeys){
        sortedKeys.push('grade');
    }
    if('race7' in aggrsKeys){
        sortedKeys.push('race7');
    }

    var v = null;
    if (aggrsKeys.length > 0) {
       v = 'v=' + aggrsKeys.join(',');
    }

    if('query' in apiQuery && 'question.path' in apiQuery.query) {
        var selectedQs = apiQuery.query['question.path'].value;
        for (var i = 0; i < selectedQs.length; i++) {
            queries.push('q=' + selectedQs[i] + (v? ('&' + v):''));
        }
    }

    return queries;
}


/**
 * Process YRBS service response for all questions and create response for the front end in the form given below
 * @param response
 * @returns {{table: {question: Array}, maxQuestion: string}}
 */
yrbs.prototype.processYRBSReponses = function(response){
    var questions = []
    for (r in response){
        if (response[r] && 'results' in response[r]) {
            questions.push(this.processQuestionResponse(response[r]));
        } else{
            logger.warn("Error response from YRBS: "+JSON.stringify(response[r]));
        }
    }
    var finalResp = {'table': {'question':questions}};
    logger.info("YRBS Response: "+ JSON.stringify(finalResp));
    return finalResp;
};

/**
 * Parse a response from YRBS for a single question and generate response for the frontend
 * @param response
 * @returns {{name: (Array|string|string|string|string|COLORS_ON.question|*), mental_health}}
 */
yrbs.prototype.processQuestionResponse = function(response){
    var q = {"name" :response.q,
        "mental_health": resultCellDataString(response.results[0])}; // the questions level total is the first record

    for (var i = 1; i< response.results.length; i ++){
        var r = response.results[i];
        // Process only the deepest level data which is grouped by all attributes requested
        if(r.level == response.vars.length) {
            var cell = q;

            // The result table is always nested in the order Sex (q2), Grade (q3) and Race (raceeth)
            // so nest the results in that order
            if ('sex' in r) {
                cell = getResultCell(cell, 'sex', r.sex);
            }
            if ('grade' in r) {
                cell = getResultCell(cell, 'grade', r.grade);
            }
            if ('race7' in r) {
                cell = getResultCell(cell, 'race7', r.race7);
            }
            cell['mental_health'] = resultCellDataString(r);
        }
    }
    return q;
};

function getResultCell (currentcell, cellkey, cellvalue){
    var cell;
    if(!(cellkey  in currentcell)) {
        cell = currentcell[cellkey] = [];
    }
    cell = currentcell[cellkey];
    for (i in cell){
        if (cell[i].name == cellvalue){
            return cell[i];
        }
    }
    var newcell = {'name':cellvalue};
    cell.push(newcell);
    return newcell;
}

/**
 * Generate the string for display in the result table cells, values are converted to % with 1 digit precision
 * @param yrbsresponse
 * @returns {string}
 */
function resultCellDataString (yrbsresponse){
    var prec = 1;
    return toRoundedPercentage(yrbsresponse.mean, prec) +"<br><br/><nobr>("+toRoundedPercentage(yrbsresponse.ci_l, prec) +"-"+toRoundedPercentage(yrbsresponse.ci_u, prec) +")</nobr><br/>"+yrbsresponse.count;
};

function toRoundedPercentage(num, prec){
    if (!isNaN(num)){
        return (num * 100).toFixed(prec);
    }else {
        return num;
    }

}
/**
 * Invoke the YRBS service with a single query and get response.
 * Return null if there is an error invoking YRBS or parsing the YRBS response
 * @param query in for q=q8&v=q2,q3,raceeth
 * @returns raw response from YRBS service
 */
function invokeYRBS (query){
    var deferred = Q.defer();
    request(query ,function (error, response, body)  {
        if (!error) {
            try{
                deferred.resolve(JSON.parse(body));
            }catch(e){
                logger.error("Error response from YRBS API for query "+query+": "+body);
                deferred.resolve(null);
            }
        }else {
            logger.error("Error invoking YRBS service for query "+query+": "+error);
            deferred.resolve(null);
        }
    });
    return deferred.promise;
};


module.exports = yrbs;