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
    var yrbsquery = buildYRBSQueries(apiQuery);
    var deferred = Q.defer();
    var queryPromises = [];
    for (var q in yrbsquery){
        queryPromises.push(invokeYRBS(config.yrbs.url+ '?'+yrbsquery[q]));
    }
    Q.all(queryPromises).then(function(resp){
        deferred.resolve(processYRBSReponses(resp));
    });

    return deferred.promise;
};

/**
 * Build query for YRBS service.
 * YRBS service takes only one question at a time, so this method builds one query per each question selected
 * and return an array of query string for YRBS service call
 */
function buildYRBSQueries(apiQuery){
    var queries = [];

    var aggrsKeys  = [];
    for (var i = 0; i<apiQuery.aggregations.nested.table.length; i++ ){
        var agg = apiQuery.aggregations.nested.table[i];
        if (agg.queryKey != 'question.key'){
            aggrsKeys.push(agg.queryKey);
        }
    }

    // Grouping needs to be always in the following order Sex (q2), Grade (q3) and Race (raceeth)
    aggrsKeys.sort(function (a,b) {
        return a < b ? -1 : a > b ? 1 : 0;
    });
    var v = 'v='+aggrsKeys.join(',');

    if('query' in apiQuery && 'question.path' in apiQuery.query){
    var selectedQs =apiQuery.query['question.path'].value;
        if (selectedQs.length > 0){
            for (var i = 0; i<selectedQs.length; i++){
                queries.push('q='+selectedQs[i]+'&'+v);
            }
        }
    } else {
        // Currenly hardcoding all questions list, this needs to come from the question service
        for (var i = 8; i < 99; i++) {
            queries.push('q=qn' + i + '&' + v);
        }
    }
    return queries;
}


/**
 * Process YRBS service response for all questions and create response for the front end in the form given below
 * @param response
 * @returns {{table: {question: Array}, maxQuestion: string}}
 */
function processYRBSReponses(response){
    var questions = []
    for (r in response){
        questions.push(processQuestionResponse(response[r]));
    }
    var finalResp = {'table': {'question':questions}, "maxQuestion":"test"};
    logger.info("YRBS Response: "+ JSON.stringify(finalResp));
    return finalResp;
};

/**
 * Parse a response from YRBS for a single question and generate response for the frontend
 * @param response
 * @returns {{name: (Array|string|string|string|string|COLORS_ON.question|*), mental_health}}
 */
function processQuestionResponse (response){
    var q = {"name" :response.q,
        "mental_health": resultCellDataString(response.results[0])}; // the questions level total is the first record

    for (var i = 1; i< response.results.length; i ++){
        var r = response.results[i];
        var cell = q;
        // The result table is always nested in the order Sex (q2), Grade (q3) and Race (raceeth)
        // so nest the results in that order
        if('q2' in r) {
            cell = getResultCell(cell, 'q2', r.q2);
        }
        if('raceeth' in r) {
            cell = getResultCell(cell, 'raceeth', r.raceeth);
        }
        if('q3' in r) {
            cell = getResultCell(cell, 'q3', r.q3);
        }
        cell['mental_health'] = resultCellDataString(r);
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
 * Generate the string for display in the result table cells
 * @param yrbsresponse
 * @returns {string}
 */
function resultCellDataString (yrbsresponse){
    return yrbsresponse.mean +"<br><br/><nobr>("+yrbsresponse.ci_l+"-"+yrbsresponse.ci_u+")</nobr><br/>"+yrbsresponse.count;
};

/**
 * Invoke the YRBS service with a single query and get response
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
                logger.error("Error response from YRBS API: "+body);
                deferred.reject("Error response from YRBS API, unable to parse");
            }
        }else {
            deferred.reject(error);
        }
    });
    return deferred.promise;
};


module.exports = yrbs;