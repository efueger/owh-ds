var logger = require('../config/logging');
var request = require('request');
var xmlbuilder = require('xmlbuilder');
var X2JS = require('x2js');
var inspect = require('util').inspect;
var q = require('q');

const WONDER_API_URL = "https://wonder.cdc.gov/controller/datarequest/";

var wonderParamCodeMap = {
    'race': 'D76.V8',
    'gender': 'D76.V7',
    'hispanicOrigin':'D76.V17',
    'year':'D76.V1',
    'year-group':'D76.V1-level1',
    'agegroup':'D76.V51',
    'weekday':'D76.V24',
    'autopsy':'D76.V20',
    'placeofdeath':'D76.V21',
    'month':'D76.V1-level2',
    'ucd-filters':'D76.V2',
    'mcd-filters':''
}

/**
 * Init wonder API with dataset id
 * @param dbID
 */
function wonder(dbID) {
    this.dbID = dbID;
}

/**
 * Invoke WONDER rest API
 * @param query Query from the front end
 * @result processed result from WONDER in the following format
 * {
  American Indian or Alaska Native:{
    Female:{ ageAdjustedRate:'514.1'  },
    Male:{ ageAdjustedRate:'685.4'  },
    Total:{ ageAdjustedRate:'594.1' }
  },
  'Asian or Pacific Islander':{
    Female:{ ageAdjustedRate:'331.1' },
    Male:{ ageAdjustedRate:'462.0' },
    Total:{ ageAdjustedRate:'388.3' }
  },
  'Black or African American':{
    Female:{ ageAdjustedRate:'713.3'  },
    Male:{ ageAdjustedRate:'1,034.0'  },
    Total:{ ageAdjustedRate:'849.3' }
  },
  White:{
    Female:{ ageAdjustedRate:'617.6' },
    Male:{ ageAdjustedRate:'853.4' },
    Total:{ ageAdjustedRate:'725.4' }
  },
  Total:{ ageAdjustedRate:'724.6' }

  The attribute are nested in the same order the attributed specified in grouping
  in the input query
}
 *
 */
wonder.prototype.invokeWONDER = function (query){
    console.log('creating request');
    var req = createWONDERRquest(query);
    //console.log(inspect(req, {depth : null, colors : true} ));
    //var groupattrs = getGroupAttributes(query);
    var defer = q.defer();
    console.log('sending post');
    request.post({url:WONDER_API_URL+this.dbID, form:{request_xml:req} },function (error, response, body) {
        result = {};
        if (! error) {
            result = processWONDERResponse(body);
            console.log('wonder result', result);
            //logger.debug("Age adjusted rates: "+inspect(result, {depth:null}));
            logger.debug("Age adjusted rates: "+JSON.stringify(result));
            console.log('wonder promise resolved');
            defer.resolve(result);
        } else{
            console.log('wonder error');
            logger.error("WONDER Error: "+error);
            defer.reject('Error invoking WONDER API');
        }
        //console.log(inspect(result, {depth: null, colors: true}));
    }, function (error) {
        console.log('wonder promise error');
        logger.error("WONDER Error: "+error);
        defer.reject('Error invoking WONDER API');

    });
    return defer.promise;
};



/**
 * Parse WONDER response and extract the age adjusted death date data
 * @param response raw WONDER response
 * @returns age adjust death data by the specified gropings
 */
function processWONDERResponse(response){
    var x = new X2JS();
    var respJson = x.xml2js(response);
    var datatable = findChildElementByName(findChildElementByName(respJson.page, 'response'), 'data-table');
    //console.log(inspect(datatable, {depth : null, colors : true} ));
    result = {}
    if(datatable) {
        for (r in datatable.r) {
            row = datatable.r[r];
            cell = row.c;
            var keys = []
            for (i = 0; i <= cell.length - 4; i++) {
                if ('_l' in cell[i]) {
                    keys.push(cell[i]._l);
                } else if ('_c' in cell[i]) {
                    keys.push('Total');
                }
            }
            var val;
            var valCell = cell[cell.length - 1];
            if ('_v' in valCell) {
                val = valCell._v;
            } else {
                val = valCell._dt;
            }
            addValueToResult(keys, val, result);
        }
    }
    return result;
}

/**
 * Create a WONDER request from the HIG query
 * @param query HIG query from the UI
 * @returns WONDER request
 */
function createWONDERRquest(query){
    console.log('query', JSON.stringify(query));
    var request = xmlbuilder.create('request-parameters', {version: '1.0', encoding: 'UTF-8'});
    console.log('add param');
    addParamToWONDERReq(request, 'accept_datause_restrictions', 'true');
    request.com("Measures");
    console.log('add measures');
    addMeasures(request);
    request.com("Groups");
    console.log('add group params');
    addGroupParams(request, query.aggregations.nested.table);
    request.com("Filters");
    console.log('add filter params');
    addFilterParams(request, query.query);
    request.com("Options");
    console.log('add option params');
    addOptionParams(request);
    var reqStr = request.end({pretty:true});
    //logger.info("WONDER Request:",reqStr);
    return reqStr;
};

function addGroupParams(wreq, groups){
    if(groups){
        for (var i =1; i <= groups.length; i++){
            var gParam = wonderParamCodeMap[groups[i-1].key+'-group'];
            if(!gParam ){
                gParam = wonderParamCodeMap[groups[i-1].key];
            }
            addParamToWONDERReq(wreq,'B_'+i, gParam);
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
    addParamToWONDERReq(wreq,'O_all_labels', 'true');
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


function addValueToResult(keys, val, result){
    if(!(keys[0] in result)){
        result[keys[0]] = {};
    }
    if (keys.length == 1){
        result[keys[0]]['ageAdjustedRate'] = val;
    } else{
        addValueToResult(keys.slice(1), val,result[keys[0]]);
    }
}

function findChildElementByName(node, name){
    for (child in node){
        if(child === name){
            return  node[child];
        }
    }
}

function getGroupAttributes(query){
    var groups = []
    if(query.aggregations.nested.table){
        for (var i =1; i <= query.aggregations.nested.table.length; i++){
            groups.push(wonderParamCodeMap[query.aggregations.nested.table[i-1].key]);
        }
    }
}

module.exports = wonder;