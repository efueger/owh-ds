var Aggregation = require('../models/aggregation');
var merge = require('merge');

var populateDataWithMappings = function(resp, countKey, countQueryKey) {
    var result = {
        data: {
            simple: {},
            nested: {
                table: {},
                charts: [],
                maps:{}
            }
        },
        pagination: {
            total: resp.hits.total
        }
    };
    if(resp.aggregations) {
        var data = resp.aggregations;
        Object.keys(data).forEach(function (key) {
            var dataKey = '';
            if (key.indexOf('group_table_') > -1) {
                var groupKeyRegex = /group_table_/;
                dataKey = key.split(groupKeyRegex)[1];
                result.data.nested.table[dataKey] = populateAggregatedData(data[key].buckets, countKey, 1, undefined, countQueryKey, groupKeyRegex);
            }
            if (key.indexOf('group_chart_') > -1) {
                var keySplits = key.split("_");
                var groupKeyRegex = /group_chart_\d_/;
                dataKey = key.split(groupKeyRegex)[1];
                var dataIndex = Number(keySplits[2]);
                var aggData = {};
                aggData[dataKey] = populateAggregatedData(data[key].buckets, countKey, 3, undefined, countQueryKey, groupKeyRegex);
                result.data.nested.charts[dataIndex] = aggData;
            }
            if (key.indexOf('group_maps_') > -1) {
                var keySplits = key.split("_");
                dataKey = keySplits[3];
                var dataIndex = Number(keySplits[2]);
                var aggData = {};
                // console.log("dataIndex: "+JSON.stringify(data[key].buckets));
                aggData[dataKey] = populateAggregatedData(data[key].buckets, countKey, 3, true);
                // console.log("data");
                // console.log(dataIndex);
                // console.log(dataKey);
                result.data.nested.maps[dataKey]= aggData[dataKey];
                // console.log("done");
            } else {
                result.data.simple[key] = populateAggregatedData(data[key].buckets, countKey, undefined, undefined, countQueryKey);
            }
        });
    }
    // console.log(JSON.stringify(result));
    return result;
};

var populateAggregatedData = function(buckets, countKey, splitIndex, map, countQueryKey, regex) {
    var result = [];
    for(var index in buckets) {
        // console.log(buckets[index]);
        //ignoring key -9 for blank data.
        if (buckets[index].key!=='-9') {
            var aggregation = new Aggregation(buckets[index], countKey, countQueryKey);

            aggregation[countKey] = aggregation[countKey];
            var innerObjKey = isValueHasGroupData(buckets[index]);
            // take from pop.value instead of doc_count for census data
            if(countKey === 'pop') {
                aggregation = {name: buckets[index]['key']};
                if(buckets[index]['pop']) {
                    aggregation[countKey] = buckets[index]['pop'].value;
                } else {
                    aggregation[countKey] = sumBucketProperty(buckets[index][innerObjKey], 'pop');

                }
            }
            if(countKey === 'bridge_race') {
                aggregation = {name: buckets[index]['key']};
                if(buckets[index]['group_count_pop']) {
                    aggregation[countKey] = buckets[index]['group_count_pop'].value;
                } else {
                    aggregation[countKey] = sumBucketProperty(buckets[index][innerObjKey], 'group_count_pop');
                }
            }
            if( innerObjKey ) {
                //if you want to split group key by regex
                if (regex && (regex.test('group_table_') || regex.test('group_chart_'))) {
                    aggregation[innerObjKey.split(regex)[1]] =  populateAggregatedData(buckets[index][innerObjKey].buckets,
                        countKey, splitIndex, map, countQueryKey, regex);
                } else {//by default split group key by underscore and retrieve key based on index
                    //adding slice and join because some keys are delimited by underscore so need to be reconstructed
                    aggregation[innerObjKey.split("_").slice(splitIndex).join('_')] =  populateAggregatedData(buckets[index][innerObjKey].buckets, countKey, splitIndex, map, countQueryKey);
                }

            }

            result.push(aggregation);
        }
    }
    return result;
};

function applySuppressions(obj, countKey) {

    var dataType;

    /**
     * Suppress Counts if count is less than 10
     * @param obj
     * @param countKey
     */
    var suppressCounts = function (obj, countKey) {
        for (var property in obj) {
            if (property === 'name') {
                continue;
            }
            //keep the track of data types
            if (['table', 'charts', 'maps'].indexOf(property) != -1) {
                dataType = property;
            }

            if (obj[property].constructor === Object) {
                suppressCounts(obj[property], countKey);
            } else if (obj[property].constructor === Array) {
                obj[property].forEach(function(arrObj) {
                    suppressCounts(arrObj, countKey);
                });
            } else if(obj[countKey] && obj[countKey] < 10) {
                if(dataType == 'table') {//for table data set to suppressed
                    obj[countKey] = 'suppressed';
                } else {//for chart and map set suppressed values to 0
                    obj[countKey] = 0;
                }
            }
        }
    };
    /**
     * Suppress totals if one of the count is suppressed
     * @param obj
     * @param countKey
     */
    var suppressTotalCounts = function (obj, countKey) {
        for (var property in obj) {

            if (property === 'name') {
                continue;
            }

            if (['table', 'charts', 'maps'].indexOf(property) != -1) {
                dataType = property;
            }

            if (obj[property].constructor === Object) {
                if (obj[countKey] && JSON.stringify(obj).indexOf('suppressed') != -1 ) {
                    if(dataType == 'table') {
                        obj[countKey] = 'suppressed';
                    } else {
                        obj[countKey] = 0;
                    }
                }
                suppressTotalCounts(obj[property], countKey);
            } else if (obj[property].constructor === Array) {
                obj[property].forEach(function(arrObj) {
                    if (obj[countKey] && JSON.stringify(obj).indexOf('suppressed') != -1 ) {
                        if(dataType == 'table') {//for table data set to suppressed
                            obj[countKey] = 'suppressed';
                        } else {//for chart and map set suppressed values to 0
                            obj[countKey] = 0;
                        }
                    }
                    suppressTotalCounts(arrObj, countKey);
                });
            }
        }
    };

    suppressCounts(obj.data, countKey);
    suppressTotalCounts(obj.data, countKey);
}

var sumBucketProperty = function(bucket, key) {
    var sum = 0;
    for(var i = 0; i < bucket.buckets.length; i++) {
        if(bucket.buckets[i][key]) {
            sum += bucket.buckets[i][key].value;
        } else if(bucket.buckets[i].key !== '-9'){
            //recurse with next bucket
            sum += sumBucketProperty(bucket.buckets[i][isValueHasGroupData(bucket.buckets[i])], key);
        }
    }
    return sum;
};

var isValueHasGroupData = function(bucket) {
    for ( var key in bucket ){
        if ( typeof bucket[key] === 'object' && bucket[key].hasOwnProperty('buckets')){
            return key;
        }
    }
    return false;
};

//matches suppressed table totals with corresponding side filter total and replace if necessary
var suppressSideFilterTotals = function(sideFilter, data) {
    for(var key in data) {
        if(key !== 'natality' && key !== 'deaths' && key !== 'name' && key !== 'ageAdjustedRate' && key !== 'standardPop' && key !== 'pop') {
            for(var i = 0; i < data[key].length; i++) {
                if(data[key][i].deaths === 'suppressed') {
                    for(var j = 0; j < sideFilter[key].length; j++) {
                        if(sideFilter[key][j].name === data[key][i].name) {
                            sideFilter[key][j].deaths = data[key][i].deaths;
                        }
                    }
                }
                suppressSideFilterTotals(sideFilter, data[key][i]);
            }
        }
    }
};

var populateYRBSData = function( results, headers, aggregations) {
    var data = {};
    data[aggregations[0].key] = [];
    var maxQuestion = {
        key: '',
        count: 0
    };
    for(var resultIndex in results) {
        var eachResult = results[resultIndex];
        data[aggregations[0].key] = populateEachYRBSResultData(eachResult._source, headers, aggregations, data[aggregations[0].key], undefined, maxQuestion, undefined);
    }
    return {table: data, maxQuestion: maxQuestion.key} ;
};

var populateEachYRBSResultData = function (eachResult, headers, aggregations, data, finalResultData, maxQuestion, finalPercentData) {
    data = data ? data : [];
    if(aggregations.length > 0) {
        var currentAggregation = aggregations[0];
        var queryKey = currentAggregation.queryKey ? currentAggregation.queryKey : currentAggregation.key;
        var currentAggregationValue = eval('eachResult.' + queryKey);
        if(currentAggregation.isPrimary) {
            for(var headerIndex in headers) {
                var currentHeader = headers[headerIndex];
                currentHeader.getPercent = currentAggregation.getPercent;
                var eachHeaderData = eachResult[currentHeader.key];
                var countData = getYRBSCount(eachHeaderData);
                var percentData = eachHeaderData ? Number(eachHeaderData.percent) : 0;
                percentData = isNaN(percentData) ? 0 : percentData;
                data = populateEachHeaderYRBSResultData(eachResult, headers, aggregations, data, countData, maxQuestion, currentHeader, currentHeader.key, percentData);
            }
        } else {
            data = populateEachHeaderYRBSResultData(eachResult, headers, aggregations, data, finalResultData, maxQuestion, currentAggregation, currentAggregationValue, finalPercentData);
        }
       /* var queryKey = currentAggregation.queryKey ? currentAggregation.queryKey : currentAggregation.key;
        var currentAggregationValue = eachResult[queryKey];
        var dataIndex = findIndexByKeyAndValue(data, 'name', currentAggregationValue);
        if(dataIndex < 0) {
            data.push({
                name: eachResult[queryKey],
                mental_health: currentAggregation.key === 'question' ? getYRBSCount(eachResult) : finalResultData
            });
            dataIndex = 0;
        }
        if(aggregations.length > 1) {
            var nextAggregation = aggregations[1];
            data[dataIndex][nextAggregation.key] = populateAggregatedData(eachResult, headers, aggregations.slice(1), data[dataIndex][nextAggregation.key], finalResultData)
        }*/
    }
    return data;
};

var populateEachHeaderYRBSResultData = function (eachResult, headers, aggregations, data, finalResultData, maxQuestion, currentAggregation, currentAggregationValue, finalPercentData) {
    var dataIndex = findIndexByKeyAndValue(data, 'name', currentAggregationValue);
    if(dataIndex < 0) {
        var mental_healthData;
        if(currentAggregation.getPercent) {
            mental_healthData = finalPercentData;
        } else {
            mental_healthData = currentAggregation.key === 'question' ? getYRBSCount(eachResult) : finalResultData;
        }
        data.push({
            name: currentAggregationValue,
            mental_health: mental_healthData
        });
        if(currentAggregation.key === 'question') {
            var count = Number(eachResult.count);
            if(!isNaN(count) && count > maxQuestion.count) {
                maxQuestion.count = count;
                maxQuestion.key = eachResult.question.key;
            }
        }
        dataIndex = data.length - 1;
    }
    if(aggregations.length > 1) {
        var nextAggregation = aggregations[1];
        data[dataIndex][nextAggregation.key] = populateEachYRBSResultData(eachResult, headers, aggregations.slice(1), data[dataIndex][nextAggregation.key], finalResultData, maxQuestion, finalPercentData)
    }
    return data;
};

var getYRBSCount = function(jsonObject) {
    if(jsonObject) {
        var count = jsonObject.count;
        var countWithCommas = isNaN(Number(count)) ? count : numberWithCommas(Number(count));
        var percent = jsonObject.percent;
        percent = isNaN(Number(percent)) || Number(percent) !== -99 ? percent : 'N/A';
        return percent + "<br/><nobr>(" + jsonObject.lower_confidence + "&#8209;" + jsonObject.upper_confidence + ")</nobr><br/>" + countWithCommas
    }
    return '';
};

//merge age adjust death rates into mortality response
var mergeAgeAdjustedRates = function(mort, rates) {
    var keyMap = {
        'Black': 'Black or African American',
        'American Indian': 'American Indian or Alaska Native',
        'Hispanic': 'Hispanic or Latino',
        'Non-Hispanic': 'Not Hispanic or Latino'
    };

    for(var key in mort) {
        if(key !== 'natality' && key !== 'deaths' && key !== 'name' && key !== 'pop' && key !== 'ageAdjustedRate' && key !== 'standardPop') {
            for(var i = 0; i < mort[key].length; i++) {
                var age = rates[mort[key][i].name];
                if(!age) {
                    age = rates[keyMap[mort[key][i].name]];
                }
                //if key still doesn't exist, exit without merging
                if(!age) {
                    return;
                }
                if(age['Total']) {
                    mort[key][i]['ageAdjustedRate'] = age['Total'].ageAdjustedRate;
                    mort[key][i]['standardPop'] = age['Total'].standardPop;
                    mergeAgeAdjustedRates(mort[key][i], age);
                } else {
                    mort[key][i]['ageAdjustedRate'] = age.ageAdjustedRate;
                    mort[key][i]['standardPop'] = age.standardPop;
                }
            }
        }
    }
};


/**
 * Finds and returns the first object in array of objects by using the key and value
 * @param a
 * @param key
 * @param value
 * @returns {*}
 */
var findIndexByKeyAndValue = function (a, key, value) {
    for (var i = 0; i < a.length; i++) {
        if ( a[i][key] && a[i][key] === value ) {return i;}
    }
    return -1;
};

function numberWithCommas(number) {
    return number.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
};
module.exports.populateDataWithMappings = populateDataWithMappings;
module.exports.populateYRBSData = populateYRBSData;
module.exports.mergeAgeAdjustedRates = mergeAgeAdjustedRates;
module.exports.suppressSideFilterTotals = suppressSideFilterTotals;
module.exports.applySuppressions = applySuppressions;
