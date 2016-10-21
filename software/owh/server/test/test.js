var supertest = require("supertest");
var should = require("should");
var expect = require("expect.js");

var result = require("../models/result");
var Aggregation = require("../models/aggregation");
var route = require("../routes/route");
var search = require("../routes/search");
var elasticQueryBuilder = require("../api/elasticQueryBuilder");
var searchUtils = require("../api/utils");
var elasticSearch = require("../models/elasticSearch");

//istanbul cover node_modules/mocha/bin/_mocha -- -R spec
describe("Results", function(){
    it("Build result json object with pagination", function(done){
        var resultObj = new result(200, [], {total:100, from:0, size:10}, "success");
        resultObj.status.should.equal(200);
        resultObj.messages.should.equal("success");
        should(resultObj).have.property('pagination', {total:100, from:0, size:10});
        done()
    });

    it("Build result json object without pagination", function(done){
        var resultObj = new result(200, [], undefined, "success");
        resultObj.status.should.equal(200);
        resultObj.messages.should.equal("success");
        expect(resultObj.pagination).to.be(undefined);
        done()
    });
});

describe("Aggregations", function(){
    it("Build aggregation bucket object", function(done){
        var aggregationObj = new Aggregation({key:"Bucket key", doc_count:100}, "deaths");
        should(aggregationObj).have.property('name', "Bucket key");
        should(aggregationObj).have.property('deaths', 100);
        done()
    });
});

describe("Build elastic search queries", function(){
    it("Build search query with empty query and aggregations", function(done){
        var params = {query:{}, aggregations:{}};
        var result = elasticQueryBuilder.buildSearchQuery(params, true)
        var query = result[0];
        should(query).have.property('aggregations', {});
        should(query).have.property('size', 0);
        should(result[1]).be.not.ok;

        done()
    });

    it("Build search query with empty query and simple aggregations", function(done){
        var params = {query:{}, aggregations:{ simple:[{ key:"year", queryKey:"current_year", size:100000}]}};
        var result = elasticQueryBuilder.buildSearchQuery(params, true);
        var query = result[0];
        should(query).have.property('aggregations', {"year":{"terms":{"field":"current_year","size":100000}}});
        should(query).have.properties('query', 'size');
        should(query).have.property('size', 0);
        should(result[1]).be.not.ok;
        done()
    });
    it("Build search query with empty query and simple and nested aggregations", function(done){
        var params = {query:{}, aggregations:{ simple:[{ key:"year", queryKey:"current_year", size:100000}], nested:[]}};
        var query = elasticQueryBuilder.buildSearchQuery(params, true)[0];
        should(query).have.property('aggregations', {"year":{"terms":{"field":"current_year","size":100000}}});
        should(query).have.properties('query', 'size');
        should(query).have.property('size', 0);
        done()
    });

    it("Build search query with empty query and simple and nested aggregations", function(done){
        var params = {aggregations:{ simple:[{ key:"year", queryKey:"current_year", size:100000}],
            nested:{
                charts: [[{ key:"gender",  queryKey:"sex",  size:100000}, { key:"race",  queryKey:"race",  size:100000}]],
                maps: [[{ key:"states",  queryKey:"state",  size:100000}, { key:"sex",  queryKey:"sex",  size:100000}]],
                table : [{ key:"gender", queryKey:"sex", size:100000}, { key:"race", queryKey:"race", size:100000},{"key":"year","queryKey":"current_year","size"
                    :100000}]
            }
        }
        };
        var result = elasticQueryBuilder.buildSearchQuery(params, true);
        var query =result[0];
        var censusQuery = result[1];
        should(query.aggregations).have.properties('year', 'group_table_gender', 'group_chart_0_gender','group_maps_0_states');
        should(query.aggregations.group_table_gender.aggregations).have.properties('group_table_race');
        should(query.aggregations.group_table_gender.aggregations.group_table_race.aggregations).have.properties('group_table_year');
        should(query).have.properties('query', 'size');
        should(query).have.property('size', 0);
        should(censusQuery).be.ok;
        should(censusQuery.aggregations).have.properties('group_table_gender');
        should(censusQuery.aggregations.group_table_gender.aggregations).have.properties('group_table_race');
        should(censusQuery.aggregations.group_table_gender.aggregations.group_table_race.aggregations).have.properties('group_table_year');
        should(censusQuery.aggregations.group_table_gender.aggregations.group_table_race.aggregations.group_table_year.aggregations).have.properties('pop');
        should(censusQuery.aggregations.group_table_gender.aggregations.group_table_race.aggregations.group_table_year.aggregations.pop.sum.field).be.equal("pop");
        done()
    });

    it("Build search query with query", function(done){
        var params = {
            "query":{
                "current_year":{"key":"year","queryKey":"current_year","value":"2014","primary":false, caseChange:false},
                "sex":{"key":"gender","queryKey":["sex", "gender"],"value":["M"],"primary":false, caseChange:true},
                "start_date":{"key":"created_date","queryKey":"start_date","value":["M"],"primary":false, dataType:"date", caseChange:false},
                "week_of_death":{"key":"weekday","queryKey":"week_of_death","value":"6","primary":false, caseChange:true},

                "race":{"key":"race","queryKey":"race","value":"1","primary" :true, caseChange:true},
                "created_date":{"key":"created_date","queryKey":["created_date", "start_date"],"value":"M","primary":true,
                    dataType:"date", caseChange:false},
                "month_of_death":{"key":"month","queryKey":"month_of_death","value" :["12"],"primary":false, caseChange:false},
                "autopsy":{"key":"autopsy","queryKey":["autopsy","autopsy_data"],"value":["N"],"primary":true, caseChange:true},

                "dummy":{"key":"dummy","queryKey":"","value":["N"],"primary":true, caseChange:true}
            }, aggregations:{}, pagination:{from:0, size:0}};
        var query = elasticQueryBuilder.buildSearchQuery(params, false);
        should(query[0]).be.ok;
        should(query[1]).not.be.ok;
        /*console.log("query")
        console.log(JSON.stringify(query))
        console.log("query")*/
        done()
    });

    it("Build search query with empty primary query and non-empty filter query", function(done){
        var params = {
            "query":{
                "current_year":{"key":"year","queryKey":"current_year","value":"2014","primary":false, caseChange:false},
                "sex":{"key":"gender","queryKey":["sex", "gender"],"value":["M"],"primary":false, caseChange:true},
                "start_date":{"key":"created_date","queryKey":"start_date","value":["M"],"primary":false, dataType:"date", caseChange:false},
                "week_of_death":{"key":"weekday","queryKey":"week_of_death","value":"6","primary":false, caseChange:true}
            }, aggregations:{}, pagination:{from:0, size:0}};
        var query = elasticQueryBuilder.buildSearchQuery(params, false);
        should(query[0]).be.ok;
        should(query[1]).not.be.ok;
        /*console.log("query")
        console.log(JSON.stringify(query))
        console.log("query")*/
        done()
    });
    it("Build search query with empty invalid query key", function(done){
        var params = {
            "query":{
                "current_year":{"key":"year","queryKey": new Object(),"value":"2014","primary":false, caseChange:false}
            }, aggregations:{}, pagination:{from:0, size:0}};
        var query = elasticQueryBuilder.buildSearchQuery(params, false);
        should(query[0]).be.ok;
        should(query[1]).not.be.ok;
        /*console.log("query")
        console.log(JSON.stringify(query))
        console.log("query")*/
        done()
    });
});

describe("Utils", function(){
    it("Populate results with mappings with aggregation data", function(done){
        var response = {"took":592,"timed_out":false,"_shards":{"total":5,"successful":5,"failed":0},"hits":{"total":2630800,"max_score":0,"hits":[]},"aggregations":{"group_table_hispanicOrigin":{"doc_count_error_upper_bound":0,"sum_other_doc_count":0,"buckets":[{"key":"100-199","doc_count":2451125,"group_table_gender":{"doc_count_error_upper_bound":0,"sum_other_doc_count":0,"buckets":[{"key":"M","doc_count":1232427,"group_table_race":{"doc_count_error_upper_bound":0,"sum_other_doc_count":0,"buckets":[{"key":"1","doc_count":1036703},{"key":"2","doc_count":155000},{"key":"4","doc_count":31376},{"key":"-9","doc_count":9348}]}},{"key":"F","doc_count":1218698,"group_table_race":{"doc_count_error_upper_bound":0,"sum_other_doc_count":0,"buckets":[{"key":"1","doc_count":1032222},{"key":"2","doc_count":149107},{"key":"4","doc_count":29566},{"key":"3","doc_count":7803}]}}]}},{"key":"210-219","doc_count":96451,"group_table_gender":{"doc_count_error_upper_bound":0,"sum_other_doc_count":0,"buckets":[{"key":"M","doc_count":54314,"group_table_race":{"doc_count_error_upper_bound":0,"sum_other_doc_count":0,"buckets":[{"key":"1","doc_count":53574},{"key":"2","doc_count":305},{"key":"3","doc_count":298},{"key":"4","doc_count":137}]}},{"key":"F","doc_count":42137,"group_table_race":{"doc_count_error_upper_bound":0,"sum_other_doc_count":0,"buckets":[{"key":"1","doc_count":41619},{"key":"2","doc_count":234},{"key":"3","doc_count":214},{"key":"4","doc_count":70}]}}]}}]},"group_maps_0_states":{"doc_count_error_upper_bound":0,"sum_other_doc_count":0,"buckets":[{"key":"NY","doc_count":53107,"group_maps_0_sex":{"doc_count_error_upper_bound":0,"sum_other_doc_count":0,"buckets":[{"key":"M","doc_count":27003},{"key":"F","doc_count":26104}]}},{"key":"MT","doc_count":53060,"group_maps_0_sex":{"doc_count_error_upper_bound":0,"sum_other_doc_count":0,"buckets":[{"key":"M","doc_count":26800},{"key":"F","doc_count":26260}]}}]},"group_chart_0_gender":{"doc_count_error_upper_bound":0,"sum_other_doc_count":0,"buckets":[{"key":"M","doc_count":1331232,"group_chart_0_hispanicOrigin":{"doc_count_error_upper_bound":0,"sum_other_doc_count":0,"buckets":[{"key":"100-199","doc_count":1232427},{"key":"210-219","doc_count":54314},{"key":"260-269","doc_count":11893},{"key":"280-299","doc_count":8342},{"key":"270-274","doc_count":7832},{"key":"996-999","doc_count":5552},{"key":"221-230","doc_count":3902},{"key":"231-249","doc_count":3052},{"key":"275-279","doc_count":1885},{"key":"220","doc_count":1295},{"key":"250-259","doc_count":394},{"key":"200-209","doc_count":344}]}},{"key":"F","doc_count":1299568,"group_chart_0_hispanicOrigin":{"doc_count_error_upper_bound":0,"sum_other_doc_count":0,"buckets":[{"key":"100-199","doc_count":1218698},{"key":"210-219","doc_count":42137},{"key":"260-269","doc_count":9937},{"key":"270-274","doc_count":7473},{"key":"280-299","doc_count":7222},{"key":"221-230","doc_count":3677},{"key":"996-999","doc_count":3547},{"key":"231-249","doc_count":3057},{"key":"275-279","doc_count":1978},{"key":"220","doc_count":1191},{"key":"250-259","doc_count":357},{"key":"200-209","doc_count":294}]}}]}}}
        var result = searchUtils.populateDataWithMappings(response, 'deaths');
        should(result).have.properties('data');
        should(result.data).have.properties('simple', 'nested');
        should(result.data.nested).have.properties('table', 'charts', 'maps');
        should(result.data.nested.maps).have.properties('states');
        should(result.data.simple).have.properties('group_table_hispanicOrigin', 'group_chart_0_gender');
        done()
    });

    it("Populate results with mappings without aggregation data", function(done){
        var response = { "took": 592, "timed_out": false, "_shards": { "total": 5, "successful": 5, "failed": 0 }, "hits": {
            "total": 2630800, "max_score": 0, "hits": [] }};
        var result = searchUtils.populateDataWithMappings(response, 'deaths');
        should(result).have.properties('data');
        should(result.data).have.properties('simple', 'nested');
        should(result.data.nested).have.properties('table', 'charts', 'maps');
        done()
    });

    it("Populate YRBS results with headers ", function(done){
        var response = [{"_index":"owh","_type":"yrbs","_id":"28093","_score":1,"_source":{"count":"15555","primary_filter":"race","nhopi":{"count":"97","lower_confidence":"N/A","percent":"N/A","upper_confidence":"N/A"},"question":{"category":"Unintentional Injuries and Violence","path":["Unintentional Injuries and Violence","Riding with a drinking driver"],"key":"Riding with a drinking driver","label":"Rode with a driver who had been drinking alcohol(in a car or other vehicle one or more times during the 30 days before the survey)"},"lower_confidence":"18.4","percent":"20.0","ai_an":{"count":"161","lower_confidence":"16.8","percent":"25.3","upper_confidence":"36.2"},"grade":"all","black_african_american":{"count":"1655","lower_confidence":"17.2","percent":"21.1","upper_confidence":"25.6"},"hispanic":{"count":"5101","lower_confidence":"24.4","percent":"26.2","upper_confidence":"28.2"},"race":"all-races-ethnicities","asian":{"count":"625","lower_confidence":"7.8","percent":"11.2","upper_confidence":"15.8"},"year":"2015","multiple_race":{"count":"738","lower_confidence":"15.7","percent":"19.6","upper_confidence":"24.2"},"white":{"count":"6837","lower_confidence":"15.9","percent":"17.7","upper_confidence":"19.6"},"sex":"both","upper_confidence":"21.6"}},{"_index":"owh","_type":"yrbs","_id":"28098","_score":1,"_source":{"count":"15468","primary_filter":"race","nhopi":{"count":"99","lower_confidence":"N/A","percent":"N/A","upper_confidence":"N/A"},"question":{"category":"Unintentional Injuries and Violence","path":["Unintentional Injuries and Violence","Weapon carrying at school"],"key":"Weapon carrying at school","label":"Carried a weapon on school property(such as, a gun, knife, or club, on at least 1 day during the 30 days before the survey)"},"lower_confidence":"3.5","percent":"4.1","ai_an":{"count":"160","lower_confidence":"6.4","percent":"10.5","upper_confidence":"16.7"},"grade":"all","black_african_american":{"count":"1642","lower_confidence":"2.3","percent":"3.4","upper_confidence":"5.1"},"hispanic":{"count":"5064","lower_confidence":"3.5","percent":"4.5","upper_confidence":"5.8"},"race":"all-races-ethnicities","asian":{"count":"620","lower_confidence":"1.1","percent":"2.3","upper_confidence":"4.5"},"year":"2015","multiple_race":{"count":"733","lower_confidence":"3.3","percent":"5.7","upper_confidence":"9.7"},"white":{"count":"6814","lower_confidence":"2.9","percent":"3.7","upper_confidence":"4.6"},"sex":"both","upper_confidence":"4.7"}}];
        var headers = [{"key":"ai_an","title":"American Indian or Alaska Native"},{"key":"asian","title":"Asian"},{"key":"black_african_american","title":"Black or African American"},{"key":"hispanic","title":"Hispanic or Latino"},{"key":"nhopi","title":"Native Hawaiian or Other Pacific Islander"},{"key":"white","title":"White"},{"key":"multiple_race","title":"Multiple Race"}];
        var aggregations = [{"key":"question","queryKey":"question.key","size":100000},{"key":"yrbsRace","queryKey":"race","size":100000,"isPrimary":true}];
        var result = searchUtils.populateYRBSData(response, headers, aggregations)
        should(result).have.properties('table');
        done()
    });
});
