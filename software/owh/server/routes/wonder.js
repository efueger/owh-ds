var logger = require('../config/logging');
var request = require('request');
var xmlbuilder = require('xmlbuilder');

const WONDER_API_URL = "https://wonder.cdc.gov/controller/datarequest/";

var wonderParamCodeMap = {
    'race': 'D76.V8',
    'gender': 'D76.V7',
    'hispanicOrigin':'D76.V17',
    'year':'D76.V1',
    'agegroup':'D76.V51',
    'weekday':'D76.V24',
    'autopsy':'D76.V20',
    'placeofdeath':'D76.V21',
    'month':'D76.V1-level2',
    'ucd-filters':'D76.V2',
    'mcd-filters':''
}

const ALL_PARAMS  = {

    'D76.V10' : {'label':'Census Regions', default:'*All*'},
    'D76.V27' : {'label':'HHS Regions', default:'*All*'},
    'D76.V9' : {'label':'States', default:'*All*'},
    'D76.V19' : {'label':'2013 Urbanization', default:'*All*'},
    //'D76.V5' : {'label':'Ten-Year Age Groups', default:'*All*'},
    'D76.V51' : {'label':'Five-Year Age Groups', default:'*All*'},
    //'D76.V6' : {'label':'Infant Age Groups', default:'*All*'},
    'D76.V7'  : {'label':'Gender', default:'*All*'},
    'D76.V17' : {'label':'Hispanic Origin', default:'*All*'},
    'D76.V8' : {'label':'Race', default:'*All*'},
    'D76.V1-level1' : {'label':'Year', default:'*All*'},
    'D76.V24' : {'label':'Weekday', default:'*All*'},
    'D76.V20' : {'label':'Autopsy', default:'*All*'},
    'D76.V21' : {'label':'Place of Death', default:'*All*'},
    'D76.V28' : {'label':'15 Leading Causes of Death', default:'*All*'},
    'D76.V29' : {'label':'15 Leading Causes of Death (Infants)', default:'*All*'},
    'D76.V2' : {'label':'ICD-10 Codes', default:'*All*'},
    'D76.V4' : {'label':'ICD-10 113 Cause List', default:'*All*'},
    'D76.V12' : {'label':'ICD-10 130 Cause List (Infants)', default:'*All*'},
    'D76.V22' : {'label':'Injury Intent', default:'*All*'},
    'D76.V23' : {'label':'Injury Mechanism &amp; All Other Leading Causes', default:'*All*'},
    'D76.V25' : {'label':'Drug/Alcohol Induced Causes', default:'*All*'},


}
function wonder(dbID) {
    this.dbID = dbID;
}

/**
 * Invoke WONDER rest API
 * @param query Query from the front end
 */
wonder.prototype.invokeWONDER = function (query){
    var req = createWONDERRquest(query);
    request.post({url:WONDER_API_URL+this.dbID, form:{request_xml:req} },function (error, response, body) {
        logger.info("Error:"+error);
        logger.info("Response:"+response);
        logger.info("Body:"+body);
    });
    return new Promise(function(resolve, reject) {
        // setTimeout(resolve(true), 1000);
        resolve(true);
    });

};

//wonder.prototype.invokeWONDER = function (req) {
//    request.post(WONDER_API_URL+this.dbID).form('request_xml',req).then( function(resp){
//            console.log("WONDER Resp:" + resp);
//        }
//
//    );
//}

function createWONDERRquest(query){
    var request = xmlbuilder.create('request-parameters', {version: '1.0', encoding: 'UTF-8'});
    addParamToWONDERReq(request, 'accept_datause_restrictions', 'true');
    request.com("Measures");
    addMeasures(request);
    request.com("Groups");
    addGroupParams(request, query.aggregations.nested.table);
    request.com("Filters");
    addFilterParams(request, query.query);
    request.com("Options");
    addOptionParams(request);
    var reqStr = request.end({pretty:true});
    logger.info("WONDER Request:",reqStr);
    return reqStr;
};

function addGroupParams(wreq, groups){
    if(groups){
        for (var i =1; i <= groups.length; i++){
            addParamToWONDERReq(wreq,'B_'+i, wonderParamCodeMap[groups[i-1].key])
        }
    }
};

function addFilterParams (wreq, query){


    // Add mandatory advanced filter options
    addParamToWONDERReq(wreq,'V_D76.V19', '*All*');
    addParamToWONDERReq(wreq,'V_D76.V5', '*All*');
    // add mandatory state filter
    addParamToWONDERReq(wreq,'F_D76.V9', '*All*');

    if(query){
        for (var k in query){
            p = wonderParamCodeMap[query[k].key]
            v = query[k].value
            addParamToWONDERReq(wreq,'F_'+p, v);
        }
    }
};

function addMeasures(wreq) {
    // Even though we dont need the first 3, it is mandatory for WONDER
    addParamToWONDERReq(wreq,'M_1', 'D76.M1');
    addParamToWONDERReq(wreq,'M_2', 'D76.M2');
    addParamToWONDERReq(wreq,'M_3', 'D76.M3');

    // M4 is standard age adjusted rate
    addParamToWONDERReq(wreq,'M_4', 'D76.M4');
};


function addOptionParams(wreq){
    addParamToWONDERReq(wreq,'O_V10_fmode', 'freg');
    addParamToWONDERReq(wreq,'O_V1_fmode', 'freg');
    addParamToWONDERReq(wreq,'O_V27_fmode', 'freg');
    addParamToWONDERReq(wreq,'O_V2_fmode', 'freg');
    addParamToWONDERReq(wreq,'O_V9_fmode', 'freg');
    addParamToWONDERReq(wreq,'O_aar', 'aar_std');
    addParamToWONDERReq(wreq,'O_aar_pop', '0000');
    addParamToWONDERReq(wreq,'O_age', 'D76.V5'); // Age adjusted rate by 10 year interval
    addParamToWONDERReq(wreq,'O_javascript', 'off');
    addParamToWONDERReq(wreq,'O_location', 'D76.V9');
    addParamToWONDERReq(wreq,'O_precision', '1');
    addParamToWONDERReq(wreq,'O_rate_per', '100000');
    addParamToWONDERReq(wreq,'O_show_totals', 'true');
    addParamToWONDERReq(wreq,'O_ucd', 'D76.V2');
    addParamToWONDERReq(wreq,'O_urban', 'D76.V19');
}


function addParamToWONDERReq(request, paramname, paramvalue) {
    var param = request.ele('parameter');
    param.ele('name', paramname);
    if(Array.isArray(paramvalue)) {
        for (var i = 0; i<paramvalue.length; i++){
            param.ele('value', paramvalue[i]);
        }
    }else{
        param.ele('value', paramvalue);
    }
};

module.exports = wonder;