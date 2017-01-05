var Q = require('q');
var logger = require('../config/logging');
var config = require('../config/config');
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
    var startTime = new Date().getTime();
    logger.info("Invoking YRBS service for "+yrbsquery.length+" questions");
    for (var q in yrbsquery){
        queryPromises.push(invokeYRBS(config.yrbs.queryUrl+ '?'+yrbsquery[q]));
    }
    Q.all(queryPromises).then(function(resp){
        var duration = new Date().getTime() - startTime;
        logger.info("YRBS service response received for all "+yrbsquery.length+" questions, duration(s)="+ duration/1000);
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


    // Grouping needs to be always in the following order Sex (sex), Grade (grade), Race (race7) and  Year (year)
    var sortedKeys = [];
    if(aggrsKeys.indexOf('sex') >= 0){
        sortedKeys.push('sex');
    }
    if(aggrsKeys.indexOf('grade') >= 0){
        sortedKeys.push('grade');
    }
    if(aggrsKeys.indexOf('race7') >= 0){
        sortedKeys.push('race7');
    }
    if(aggrsKeys.indexOf('year') >= 0){
        sortedKeys.push('year');
    }
    var v = null;
    if (sortedKeys.length > 0) {
       v = 'v=' + sortedKeys.join(',');
    }

    if('query' in apiQuery){
        // Build filter params
        var f = '';
        for (q in apiQuery.query){
            if(q != 'question.path') {
                f += (q + ':');
                f += apiQuery.query[q].value.join(',') +';';
                // f += ';';
            }
        }
        f = f.slice(0,f.length - 1);

        if('question.path' in apiQuery.query) {
            var selectedQs = apiQuery.query['question.path'].value;
            for (var i = 0; i < selectedQs.length; i++) {
                queries.push('q=' + selectedQs[i] + (v ? ('&' + v) : '') + (f ? ('&f=' + f) : ''));
            }
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
        "mental_health": resultCellObject(response.results[0])};

    for (var i = 1; i< response.results.length; i ++){
        var r = response.results[i];
        // Process only the deepest level data which is grouped by all attributes requested
        if(r.level == response.vars.length) {
            var cell = q;

            // The result table is always nested in the order Sex (sex), Grade (grade), Race (race7) and  Year (year)
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
            if ('year' in r) {
                cell = getResultCell(cell, 'year', r.year);
            }
            cell['mental_health'] = resultCellObject(r);
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
    var newcell = {'name':cellvalue.toString()};
    cell.push(newcell);
    return newcell;
}

function resultCellObject (response) {
    var prec = 1;
    return {
        mean: toRoundedPercentage(response.mean, prec),
        ci_l: toRoundedPercentage(response.ci_l, prec),
        ci_u: toRoundedPercentage(response.ci_u, prec),
        count: response.count
    };
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
                var result = JSON.parse(body);
                logger.debug ("Received response from YRBS API for query "+query);
                deferred.resolve(result);
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

/**
 * To get questions from question service dynamically. *
 * @param yearList
 * @returns {*|promise}
 */
yrbs.prototype.getQuestionsTreeByYears = function (yearList) {
    logger.info("Getting questions from yrbs service...");
    var deferred = Q.defer();
    invokeYRBS(config.yrbs.questionsUrl).then(function (response) {
        var data = prepareQuestionTreeForYears(response, yearList);
        deferred.resolve({questionTree:data.questionTree, questionsList:data.questionsList});
    });
    return deferred.promise;
};

/**
 * Prepare YRBS question tree based on question categories
 * @param questionList
 * @param years
 */
function prepareQuestionTreeForYears(questions, years) {
    logger.info("Preparing questions tree...");
    var qCategoryMap = {};
    var questionTree = [];
    var questionsList = [];
    var catCount = 0;
    //iterate through questions
    for (var qKey in questions) {
        var quesObj = questions[qKey];
        var qCategory = quesObj.topic;
        if (qCategory && qCategoryMap[qCategory] == undefined) {
            qCategoryMap[qCategory] = {id:'cat_'+catCount, text:qCategory, children:[]};
            catCount = catCount + 1;
        } else {
            if (quesObj.description !=undefined && (years.indexOf('All') != -1 || years.indexOf(quesObj.year.toString()) != -1)) {
                var question = {text:quesObj.question +"("+quesObj.description+")", id:qKey};
                qCategoryMap[qCategory].children.push(question);
                //capture all questions into questionsList
                questionsList.push({key : quesObj.question, qkey : qKey, title : quesObj.question +"("+quesObj.description+")"});
            }
        }
    }

    for (var category in qCategoryMap) {
       qCategoryMap[category].children = sortByKey(qCategoryMap[category].children, 'text', true);
       questionTree.push(qCategoryMap[category]);
    }
    return {questionTree:questionTree, questionsList: questionsList};
}

/**
 * To sort questions
 * @param array
 * @param key
 * @param asc
 * @returns {*}
 */
function sortByKey(array, key, asc) {
    logger.info("Sorting questions in alphabetical order...");
    return array.sort(function(a, b) {
        var x = typeof(key) === 'function' ? key(a) : a[key];
        var y = typeof(key) === 'function' ? key(b) : b[key];
        if(asc===undefined || asc === true) {
            return ((x < y) ? -1 : ((x > y) ? 1 : 0));
        }else {
            return ((x > y) ? -1 : ((x < y) ? 1 : 0));
        }
    });
}

module.exports = yrbs;