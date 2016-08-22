/*
var MentalHealth = function(source, headers, aggregations) {
    var mh = this;
    mh.aggData = {};
    mh.questionCategories = {};
    for(var index in results) {
        var jsonObject = results[index]._source;
        var questionData = {};
        questionData['count'] =  jsonObject['percent']+"<br/>("+jsonObject['lower_confidence']+"-"+jsonObject['upper_confidence']+")<br/>"+jsonObject['count'];
        for(var headerIndex in headers){
            var np = jsonObject[headers[headerIndex].key];
            if (np){
                questionData[headers[headerIndex].key] = np['percent']+"("+np['lower_confidence']+"-"+np['upper_confidence']+")<br/>"+np['count'];
            }
        }

        var question = jsonObject.question;
        var questionCategory = question.category;
        var questionLabel =  question.label;
        console.log(JSON.stringify(mh.aggData));
        var eachAggData;
        if(aggKey && isAggAtStart) {
            if(!mh.aggData[jsonObject[aggKey]]) {
                mh.aggData[jsonObject[aggKey]] = {};
            }
            eachAggData = mh.aggData[jsonObject[aggKey]];
        } else {
            eachAggData = mh.aggData;
        }
        if(!eachAggData[questionCategory]) {
            eachAggData[questionCategory] = {};
        }
        if(!eachAggData[questionCategory][questionLabel]) {
            eachAggData[questionCategory][questionLabel] = {};
        }
        console.log(JSON.stringify(eachAggData));
        if(aggKey && !isAggAtStart) {
            if(!eachAggData[questionCategory][questionLabel][jsonObject[aggKey]]) {
                eachAggData[questionCategory][questionLabel][jsonObject[aggKey]] = {};
            }
            eachAggData[questionCategory][questionLabel][jsonObject[aggKey]][jsonObject.year] = questionData;
        } else {
            eachAggData[questionCategory][questionLabel][jsonObject.year] = questionData;
        }

        //mh.questionCategories[questionCategory][questionLabel][jsonObject.year] = questionData;

    }
};

MentalHealth.prototype.getRaces = function() {
    return [
        { "key": "american-indian-or-alaska-native", "title": "American Indian or Alaska Native" },
        { "key": "asian", "title": "Asian" },
        { "key": "black-or-african-american", "title": "Black or African American" },
        { "key": "hispanic-or-Latino", "title": "Hispanic or Latino" },
        { "key": "native-hawaiian-or-other-pacific-islander", "title": "Native Hawaiian or Other Pacific Islander" },
        { "key": "white", "title": "White" },
        { "key": "multiple-race", "title": "Multiple Race" },
        { "key": "all-races-ethnicities", "title": "All Races/Ethnicities" }
    ];
};

module.exports = MentalHealth;
*/
