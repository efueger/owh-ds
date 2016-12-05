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

    it("Build search query with nested aggregations and count results by pop", function(done){
        var params = {countQueryKey:'pop', aggregations:{ simple:[{ key:"year", queryKey:"current_year",  size:10}],
            nested:{
                table : [{ key:"gender", queryKey:"sex", size:10}, { key:"race", queryKey:"race", size:10},
                    {"key":"year","queryKey":"current_year","size":10}],
                charts: [[{ key:"gender",  queryKey:"sex",  size:10}, { key:"race",  queryKey:"race",  size:10}]],
            }
        }
        };
        var result = elasticQueryBuilder.buildSearchQuery(params, true);
        var query =result[0];
        should(query.aggregations).have.properties('year', 'group_table_gender', 'group_count_pop', 'group_chart_0_gender');
        should(query.aggregations.group_table_gender.aggregations).have.properties('group_table_race');
        should(query.aggregations.group_chart_0_gender.aggregations).have.properties('group_chart_0_race');
        should(query.aggregations.group_table_gender.aggregations.group_table_race.aggregations).have.properties('group_table_year');

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

    it('Populate results with populations for multiple row headers', function(done) {
        var response = {hits: {total: 420000}, aggregations: {"group_table_race": {"doc_count_error_upper_bound":0,"sum_other_doc_count":0,"buckets":[{"key":"1","doc_count":245616,"group_table_year":{"doc_count_error_upper_bound":0,"sum_other_doc_count":0,"buckets":[{"key":"2010","doc_count":35088,"group_table_gender":{"doc_count_error_upper_bound":0,"sum_other_doc_count":0,"buckets":[{"key":"F","doc_count":17544,"pop":{"value":240819728}},{"key":"M","doc_count":17544,"pop":{"value":235720766}}]}},{"key":"2002","doc_count":17544,"group_table_gender":{"doc_count_error_upper_bound":0,"sum_other_doc_count":0,"buckets":[{"key":"F","doc_count":8772,"pop":{"value":118338604}},{"key":"M","doc_count":8772,"pop":{"value":115381931}}]}},{"key":"2003","doc_count":17544,"group_table_gender":{"doc_count_error_upper_bound":0,"sum_other_doc_count":0,"buckets":[{"key":"F","doc_count":8772,"pop":{"value":119049621}},{"key":"M","doc_count":8772,"pop":{"value":116075451}}]}},{"key":"2004","doc_count":17544,"group_table_gender":{"doc_count_error_upper_bound":0,"sum_other_doc_count":0,"buckets":[{"key":"F","doc_count":8772,"pop":{"value":119757684}},{"key":"M","doc_count":8772,"pop":{"value":116912350}}]}},{"key":"2005","doc_count":17544,"group_table_gender":{"doc_count_error_upper_bound":0,"sum_other_doc_count":0,"buckets":[{"key":"F","doc_count":8772,"pop":{"value":120479718}},{"key":"M","doc_count":8772,"pop":{"value":117707377}}]}},{"key":"2006","doc_count":17544,"group_table_gender":{"doc_count_error_upper_bound":0,"sum_other_doc_count":0,"buckets":[{"key":"F","doc_count":8772,"pop":{"value":121250204}},{"key":"M","doc_count":8772,"pop":{"value":118555067}}]}},{"key":"2007","doc_count":17544,"group_table_gender":{"doc_count_error_upper_bound":0,"sum_other_doc_count":0,"buckets":[{"key":"F","doc_count":8772,"pop":{"value":122027092}},{"key":"M","doc_count":8772,"pop":{"value":119363736}}]}},{"key":"2008","doc_count":17544,"group_table_gender":{"doc_count_error_upper_bound":0,"sum_other_doc_count":0,"buckets":[{"key":"F","doc_count":8772,"pop":{"value":122797904}},{"key":"M","doc_count":8772,"pop":{"value":120168475}}]}},{"key":"2009","doc_count":17544,"group_table_gender":{"doc_count_error_upper_bound":0,"sum_other_doc_count":0,"buckets":[{"key":"F","doc_count":8772,"pop":{"value":123505997}},{"key":"M","doc_count":8772,"pop":{"value":120882836}}]}},{"key":"2011","doc_count":17544,"group_table_gender":{"doc_count_error_upper_bound":0,"sum_other_doc_count":0,"buckets":[{"key":"F","doc_count":8772,"pop":{"value":124776073}},{"key":"M","doc_count":8772,"pop":{"value":122229817}}]}},{"key":"2012","doc_count":17544,"group_table_gender":{"doc_count_error_upper_bound":0,"sum_other_doc_count":0,"buckets":[{"key":"F","doc_count":8772,"pop":{"value":125351010}},{"key":"M","doc_count":8772,"pop":{"value":122889479}}]}},{"key":"2013","doc_count":17544,"group_table_gender":{"doc_count_error_upper_bound":0,"sum_other_doc_count":0,"buckets":[{"key":"F","doc_count":8772,"pop":{"value":125890706}},{"key":"M","doc_count":8772,"pop":{"value":123494420}}]}},{"key":"2014","doc_count":17544,"group_table_gender":{"doc_count_error_upper_bound":0,"sum_other_doc_count":0,"buckets":[{"key":"F","doc_count":8772,"pop":{"value":126484060}},{"key":"M","doc_count":8772,"pop":{"value":124132221}}]}}]}},{"key":"2","doc_count":245616,"group_table_year":{"doc_count_error_upper_bound":0,"sum_other_doc_count":0,"buckets":[{"key":"2010","doc_count":35088,"group_table_gender":{"doc_count_error_upper_bound":0,"sum_other_doc_count":0,"buckets":[{"key":"F","doc_count":17544,"pop":{"value":43470275}},{"key":"M","doc_count":17544,"pop":{"value":39891409}}]}},{"key":"2002","doc_count":17544,"group_table_gender":{"doc_count_error_upper_bound":0,"sum_other_doc_count":0,"buckets":[{"key":"F","doc_count":8772,"pop":{"value":19770726}},{"key":"M","doc_count":8772,"pop":{"value":17977698}}]}},{"key":"2003","doc_count":17544,"group_table_gender":{"doc_count_error_upper_bound":0,"sum_other_doc_count":0,"buckets":[{"key":"F","doc_count":8772,"pop":{"value":20015421}},{"key":"M","doc_count":8772,"pop":{"value":18194320}}]}},{"key":"2004","doc_count":17544,"group_table_gender":{"doc_count_error_upper_bound":0,"sum_other_doc_count":0,"buckets":[{"key":"F","doc_count":8772,"pop":{"value":20277329}},{"key":"M","doc_count":8772,"pop":{"value":18461469}}]}},{"key":"2005","doc_count":17544,"group_table_gender":{"doc_count_error_upper_bound":0,"sum_other_doc_count":0,"buckets":[{"key":"F","doc_count":8772,"pop":{"value":20551032}},{"key":"M","doc_count":8772,"pop":{"value":18729699}}]}},{"key":"2006","doc_count":17544,"group_table_gender":{"doc_count_error_upper_bound":0,"sum_other_doc_count":0,"buckets":[{"key":"F","doc_count":8772,"pop":{"value":20840468}},{"key":"M","doc_count":8772,"pop":{"value":19016639}}]}},{"key":"2007","doc_count":17544,"group_table_gender":{"doc_count_error_upper_bound":0,"sum_other_doc_count":0,"buckets":[{"key":"F","doc_count":8772,"pop":{"value":21142428}},{"key":"M","doc_count":8772,"pop":{"value":19308680}}]}},{"key":"2008","doc_count":17544,"group_table_gender":{"doc_count_error_upper_bound":0,"sum_other_doc_count":0,"buckets":[{"key":"F","doc_count":8772,"pop":{"value":21446016}},{"key":"M","doc_count":8772,"pop":{"value":19602943}}]}},{"key":"2009","doc_count":17544,"group_table_gender":{"doc_count_error_upper_bound":0,"sum_other_doc_count":0,"buckets":[{"key":"F","doc_count":8772,"pop":{"value":21744516}},{"key":"M","doc_count":8772,"pop":{"value":19887934}}]}},{"key":"2011","doc_count":17544,"group_table_gender":{"doc_count_error_upper_bound":0,"sum_other_doc_count":0,"buckets":[{"key":"F","doc_count":8772,"pop":{"value":22288313}},{"key":"M","doc_count":8772,"pop":{"value":20434584}}]}},{"key":"2012","doc_count":17544,"group_table_gender":{"doc_count_error_upper_bound":0,"sum_other_doc_count":0,"buckets":[{"key":"F","doc_count":8772,"pop":{"value":22547175}},{"key":"M","doc_count":8772,"pop":{"value":20705129}}]}},{"key":"2013","doc_count":17544,"group_table_gender":{"doc_count_error_upper_bound":0,"sum_other_doc_count":0,"buckets":[{"key":"F","doc_count":8772,"pop":{"value":22804565}},{"key":"M","doc_count":8772,"pop":{"value":20967558}}]}},{"key":"2014","doc_count":17544,"group_table_gender":{"doc_count_error_upper_bound":0,"sum_other_doc_count":0,"buckets":[{"key":"F","doc_count":8772,"pop":{"value":23075345}},{"key":"M","doc_count":8772,"pop":{"value":21240749}}]}}]}},{"key":"3","doc_count":245616,"group_table_year":{"doc_count_error_upper_bound":0,"sum_other_doc_count":0,"buckets":[{"key":"2010","doc_count":35088,"group_table_gender":{"doc_count_error_upper_bound":0,"sum_other_doc_count":0,"buckets":[{"key":"F","doc_count":17544,"pop":{"value":4183319}},{"key":"M","doc_count":17544,"pop":{"value":4221568}}]}},{"key":"2002","doc_count":17544,"group_table_gender":{"doc_count_error_upper_bound":0,"sum_other_doc_count":0,"buckets":[{"key":"F","doc_count":8772,"pop":{"value":1604289}},{"key":"M","doc_count":8772,"pop":{"value":1598182}}]}},{"key":"2003","doc_count":17544,"group_table_gender":{"doc_count_error_upper_bound":0,"sum_other_doc_count":0,"buckets":[{"key":"F","doc_count":8772,"pop":{"value":1659114}},{"key":"M","doc_count":8772,"pop":{"value":1652897}}]}},{"key":"2004","doc_count":17544,"group_table_gender":{"doc_count_error_upper_bound":0,"sum_other_doc_count":0,"buckets":[{"key":"F","doc_count":8772,"pop":{"value":1716767}},{"key":"M","doc_count":8772,"pop":{"value":1712685}}]}},{"key":"2005","doc_count":17544,"group_table_gender":{"doc_count_error_upper_bound":0,"sum_other_doc_count":0,"buckets":[{"key":"F","doc_count":8772,"pop":{"value":1778645}},{"key":"M","doc_count":8772,"pop":{"value":1775711}}]}},{"key":"2006","doc_count":17544,"group_table_gender":{"doc_count_error_upper_bound":0,"sum_other_doc_count":0,"buckets":[{"key":"F","doc_count":8772,"pop":{"value":1843293}},{"key":"M","doc_count":8772,"pop":{"value":1844390}}]}},{"key":"2007","doc_count":17544,"group_table_gender":{"doc_count_error_upper_bound":0,"sum_other_doc_count":0,"buckets":[{"key":"F","doc_count":8772,"pop":{"value":1911949}},{"key":"M","doc_count":8772,"pop":{"value":1917949}}]}},{"key":"2008","doc_count":17544,"group_table_gender":{"doc_count_error_upper_bound":0,"sum_other_doc_count":0,"buckets":[{"key":"F","doc_count":8772,"pop":{"value":1986553}},{"key":"M","doc_count":8772,"pop":{"value":1997376}}]}},{"key":"2009","doc_count":17544,"group_table_gender":{"doc_count_error_upper_bound":0,"sum_other_doc_count":0,"buckets":[{"key":"F","doc_count":8772,"pop":{"value":2062396}},{"key":"M","doc_count":8772,"pop":{"value":2078819}}]}},{"key":"2011","doc_count":17544,"group_table_gender":{"doc_count_error_upper_bound":0,"sum_other_doc_count":0,"buckets":[{"key":"F","doc_count":8772,"pop":{"value":2156254}},{"key":"M","doc_count":8772,"pop":{"value":2176377}}]}},{"key":"2012","doc_count":17544,"group_table_gender":{"doc_count_error_upper_bound":0,"sum_other_doc_count":0,"buckets":[{"key":"F","doc_count":8772,"pop":{"value":2186915}},{"key":"M","doc_count":8772,"pop":{"value":2206836}}]}},{"key":"2013","doc_count":17544,"group_table_gender":{"doc_count_error_upper_bound":0,"sum_other_doc_count":0,"buckets":[{"key":"F","doc_count":8772,"pop":{"value":2216645}},{"key":"M","doc_count":8772,"pop":{"value":2236369}}]}},{"key":"2014","doc_count":17544,"group_table_gender":{"doc_count_error_upper_bound":0,"sum_other_doc_count":0,"buckets":[{"key":"F","doc_count":8772,"pop":{"value":2248348}},{"key":"M","doc_count":8772,"pop":{"value":2267184}}]}}]}},{"key":"4","doc_count":245616,"group_table_year":{"doc_count_error_upper_bound":0,"sum_other_doc_count":0,"buckets":[{"key":"2010","doc_count":35088,"group_table_gender":{"doc_count_error_upper_bound":0,"sum_other_doc_count":0,"buckets":[{"key":"F","doc_count":17544,"pop":{"value":17120081}},{"key":"M","doc_count":17544,"pop":{"value":15922488}}]}},{"key":"2002","doc_count":17544,"group_table_gender":{"doc_count_error_upper_bound":0,"sum_other_doc_count":0,"buckets":[{"key":"F","doc_count":8772,"pop":{"value":6681015}},{"key":"M","doc_count":8772,"pop":{"value":6272748}}]}},{"key":"2003","doc_count":17544,"group_table_gender":{"doc_count_error_upper_bound":0,"sum_other_doc_count":0,"buckets":[{"key":"F","doc_count":8772,"pop":{"value":6954880}},{"key":"M","doc_count":8772,"pop":{"value":6506229}}]}},{"key":"2004","doc_count":17544,"group_table_gender":{"doc_count_error_upper_bound":0,"sum_other_doc_count":0,"buckets":[{"key":"F","doc_count":8772,"pop":{"value":7225506}},{"key":"M","doc_count":8772,"pop":{"value":6741508}}]}},{"key":"2005","doc_count":17544,"group_table_gender":{"doc_count_error_upper_bound":0,"sum_other_doc_count":0,"buckets":[{"key":"F","doc_count":8772,"pop":{"value":7510126}},{"key":"M","doc_count":8772,"pop":{"value":6984291}}]}},{"key":"2006","doc_count":17544,"group_table_gender":{"doc_count_error_upper_bound":0,"sum_other_doc_count":0,"buckets":[{"key":"F","doc_count":8772,"pop":{"value":7798682}},{"key":"M","doc_count":8772,"pop":{"value":7231169}}]}},{"key":"2007","doc_count":17544,"group_table_gender":{"doc_count_error_upper_bound":0,"sum_other_doc_count":0,"buckets":[{"key":"F","doc_count":8772,"pop":{"value":8084884}},{"key":"M","doc_count":8772,"pop":{"value":7474489}}]}},{"key":"2008","doc_count":17544,"group_table_gender":{"doc_count_error_upper_bound":0,"sum_other_doc_count":0,"buckets":[{"key":"F","doc_count":8772,"pop":{"value":8373542}},{"key":"M","doc_count":8772,"pop":{"value":7721157}}]}},{"key":"2009","doc_count":17544,"group_table_gender":{"doc_count_error_upper_bound":0,"sum_other_doc_count":0,"buckets":[{"key":"F","doc_count":8772,"pop":{"value":8651166}},{"key":"M","doc_count":8772,"pop":{"value":7957865}}]}},{"key":"2011","doc_count":17544,"group_table_gender":{"doc_count_error_upper_bound":0,"sum_other_doc_count":0,"buckets":[{"key":"F","doc_count":8772,"pop":{"value":9206445}},{"key":"M","doc_count":8772,"pop":{"value":8450994}}]}},{"key":"2012","doc_count":17544,"group_table_gender":{"doc_count_error_upper_bound":0,"sum_other_doc_count":0,"buckets":[{"key":"F","doc_count":8772,"pop":{"value":9496446}},{"key":"M","doc_count":8772,"pop":{"value":8719633}}]}},{"key":"2013","doc_count":17544,"group_table_gender":{"doc_count_error_upper_bound":0,"sum_other_doc_count":0,"buckets":[{"key":"F","doc_count":8772,"pop":{"value":9808709}},{"key":"M","doc_count":8772,"pop":{"value":9008423}}]}},{"key":"2014","doc_count":17544,"group_table_gender":{"doc_count_error_upper_bound":0,"sum_other_doc_count":0,"buckets":[{"key":"F","doc_count":8772,"pop":{"value":10144311}},{"key":"M","doc_count":8772,"pop":{"value":9315183}}]}}]}}]}}};
        var expectedResult = {data: {nested: {table: {"race":[{"name":"1","pop":3384042327,"year":[{"name":"2010","pop":476540494,"gender":[{"name":"F","pop":240819728},{"name":"M","pop":235720766}]},{"name":"2002","pop":233720535,"gender":[{"name":"F","pop":118338604},{"name":"M","pop":115381931}]},{"name":"2003","pop":235125072,"gender":[{"name":"F","pop":119049621},{"name":"M","pop":116075451}]},{"name":"2004","pop":236670034,"gender":[{"name":"F","pop":119757684},{"name":"M","pop":116912350}]},{"name":"2005","pop":238187095,"gender":[{"name":"F","pop":120479718},{"name":"M","pop":117707377}]},{"name":"2006","pop":239805271,"gender":[{"name":"F","pop":121250204},{"name":"M","pop":118555067}]},{"name":"2007","pop":241390828,"gender":[{"name":"F","pop":122027092},{"name":"M","pop":119363736}]},{"name":"2008","pop":242966379,"gender":[{"name":"F","pop":122797904},{"name":"M","pop":120168475}]},{"name":"2009","pop":244388833,"gender":[{"name":"F","pop":123505997},{"name":"M","pop":120882836}]},{"name":"2011","pop":247005890,"gender":[{"name":"F","pop":124776073},{"name":"M","pop":122229817}]},{"name":"2012","pop":248240489,"gender":[{"name":"F","pop":125351010},{"name":"M","pop":122889479}]},{"name":"2013","pop":249385126,"gender":[{"name":"F","pop":125890706},{"name":"M","pop":123494420}]},{"name":"2014","pop":250616281,"gender":[{"name":"F","pop":126484060},{"name":"M","pop":124132221}]}]},{"name":"2","pop":574392420,"year":[{"name":"2010","pop":83361684,"gender":[{"name":"F","pop":43470275},{"name":"M","pop":39891409}]},{"name":"2002","pop":37748424,"gender":[{"name":"F","pop":19770726},{"name":"M","pop":17977698}]},{"name":"2003","pop":38209741,"gender":[{"name":"F","pop":20015421},{"name":"M","pop":18194320}]},{"name":"2004","pop":38738798,"gender":[{"name":"F","pop":20277329},{"name":"M","pop":18461469}]},{"name":"2005","pop":39280731,"gender":[{"name":"F","pop":20551032},{"name":"M","pop":18729699}]},{"name":"2006","pop":39857107,"gender":[{"name":"F","pop":20840468},{"name":"M","pop":19016639}]},{"name":"2007","pop":40451108,"gender":[{"name":"F","pop":21142428},{"name":"M","pop":19308680}]},{"name":"2008","pop":41048959,"gender":[{"name":"F","pop":21446016},{"name":"M","pop":19602943}]},{"name":"2009","pop":41632450,"gender":[{"name":"F","pop":21744516},{"name":"M","pop":19887934}]},{"name":"2011","pop":42722897,"gender":[{"name":"F","pop":22288313},{"name":"M","pop":20434584}]},{"name":"2012","pop":43252304,"gender":[{"name":"F","pop":22547175},{"name":"M","pop":20705129}]},{"name":"2013","pop":43772123,"gender":[{"name":"F","pop":22804565},{"name":"M","pop":20967558}]},{"name":"2014","pop":44316094,"gender":[{"name":"F","pop":23075345},{"name":"M","pop":21240749}]}]},{"name":"3","pop":55240830,"year":[{"name":"2010","pop":8404887,"gender":[{"name":"F","pop":4183319},{"name":"M","pop":4221568}]},{"name":"2002","pop":3202471,"gender":[{"name":"F","pop":1604289},{"name":"M","pop":1598182}]},{"name":"2003","pop":3312011,"gender":[{"name":"F","pop":1659114},{"name":"M","pop":1652897}]},{"name":"2004","pop":3429452,"gender":[{"name":"F","pop":1716767},{"name":"M","pop":1712685}]},{"name":"2005","pop":3554356,"gender":[{"name":"F","pop":1778645},{"name":"M","pop":1775711}]},{"name":"2006","pop":3687683,"gender":[{"name":"F","pop":1843293},{"name":"M","pop":1844390}]},{"name":"2007","pop":3829898,"gender":[{"name":"F","pop":1911949},{"name":"M","pop":1917949}]},{"name":"2008","pop":3983929,"gender":[{"name":"F","pop":1986553},{"name":"M","pop":1997376}]},{"name":"2009","pop":4141215,"gender":[{"name":"F","pop":2062396},{"name":"M","pop":2078819}]},{"name":"2011","pop":4332631,"gender":[{"name":"F","pop":2156254},{"name":"M","pop":2176377}]},{"name":"2012","pop":4393751,"gender":[{"name":"F","pop":2186915},{"name":"M","pop":2206836}]},{"name":"2013","pop":4453014,"gender":[{"name":"F","pop":2216645},{"name":"M","pop":2236369}]},{"name":"2014","pop":4515532,"gender":[{"name":"F","pop":2248348},{"name":"M","pop":2267184}]}]},{"name":"4","pop":225361970,"year":[{"name":"2010","pop":33042569,"gender":[{"name":"F","pop":17120081},{"name":"M","pop":15922488}]},{"name":"2002","pop":12953763,"gender":[{"name":"F","pop":6681015},{"name":"M","pop":6272748}]},{"name":"2003","pop":13461109,"gender":[{"name":"F","pop":6954880},{"name":"M","pop":6506229}]},{"name":"2004","pop":13967014,"gender":[{"name":"F","pop":7225506},{"name":"M","pop":6741508}]},{"name":"2005","pop":14494417,"gender":[{"name":"F","pop":7510126},{"name":"M","pop":6984291}]},{"name":"2006","pop":15029851,"gender":[{"name":"F","pop":7798682},{"name":"M","pop":7231169}]},{"name":"2007","pop":15559373,"gender":[{"name":"F","pop":8084884},{"name":"M","pop":7474489}]},{"name":"2008","pop":16094699,"gender":[{"name":"F","pop":8373542},{"name":"M","pop":7721157}]},{"name":"2009","pop":16609031,"gender":[{"name":"F","pop":8651166},{"name":"M","pop":7957865}]},{"name":"2011","pop":17657439,"gender":[{"name":"F","pop":9206445},{"name":"M","pop":8450994}]},{"name":"2012","pop":18216079,"gender":[{"name":"F","pop":9496446},{"name":"M","pop":8719633}]},{"name":"2013","pop":18817132,"gender":[{"name":"F","pop":9808709},{"name":"M","pop":9008423}]},{"name":"2014","pop":19459494,"gender":[{"name":"F","pop":10144311},{"name":"M","pop":9315183}]}]}]}}}};
        var result = searchUtils.populateDataWithMappings(response, 'pop');
        should(JSON.stringify(result.data.nested.table)).equal(JSON.stringify(expectedResult.data.nested.table));
        done();
    });

    it('Apply suppression rules when populating results', function(done) {
        var response = {"took":592,"timed_out":false,"_shards":{"total":5,"successful":5,"failed":0},"hits":{"total":2630800,"max_score":0,"hits":[]},"aggregations":{"group_table_hispanicOrigin":{"doc_count_error_upper_bound":0,"sum_other_doc_count":0,"buckets":[{"key":"100-199","doc_count":4,"group_table_gender":{"doc_count_error_upper_bound":0,"sum_other_doc_count":0,"buckets":[{"key":"M","doc_count":1232427,"group_table_race":{"doc_count_error_upper_bound":0,"sum_other_doc_count":0,"buckets":[{"key":"1","doc_count":1036703},{"key":"2","doc_count":155000},{"key":"4","doc_count":31376},{"key":"-9","doc_count":9348}]}},{"key":"F","doc_count":1218698,"group_table_race":{"doc_count_error_upper_bound":0,"sum_other_doc_count":0,"buckets":[{"key":"1","doc_count":1032222},{"key":"2","doc_count":149107},{"key":"4","doc_count":29566},{"key":"3","doc_count":7803}]}}]}},{"key":"210-219","doc_count":96451,"group_table_gender":{"doc_count_error_upper_bound":0,"sum_other_doc_count":0,"buckets":[{"key":"M","doc_count":54314,"group_table_race":{"doc_count_error_upper_bound":0,"sum_other_doc_count":0,"buckets":[{"key":"1","doc_count":53574},{"key":"2","doc_count":305},{"key":"3","doc_count":298},{"key":"4","doc_count":137}]}},{"key":"F","doc_count":42137,"group_table_race":{"doc_count_error_upper_bound":0,"sum_other_doc_count":0,"buckets":[{"key":"1","doc_count":41619},{"key":"2","doc_count":234},{"key":"3","doc_count":214},{"key":"4","doc_count":70}]}}]}}]},"group_maps_0_states":{"doc_count_error_upper_bound":0,"sum_other_doc_count":0,"buckets":[{"key":"NY","doc_count":53107,"group_maps_0_sex":{"doc_count_error_upper_bound":0,"sum_other_doc_count":0,"buckets":[{"key":"M","doc_count":27003},{"key":"F","doc_count":26104}]}},{"key":"MT","doc_count":53060,"group_maps_0_sex":{"doc_count_error_upper_bound":0,"sum_other_doc_count":0,"buckets":[{"key":"M","doc_count":26800},{"key":"F","doc_count":26260}]}}]},"group_chart_0_gender":{"doc_count_error_upper_bound":0,"sum_other_doc_count":0,"buckets":[{"key":"M","doc_count":1331232,"group_chart_0_hispanicOrigin":{"doc_count_error_upper_bound":0,"sum_other_doc_count":0,"buckets":[{"key":"100-199","doc_count":1232427},{"key":"210-219","doc_count":54314},{"key":"260-269","doc_count":11893},{"key":"280-299","doc_count":8342},{"key":"270-274","doc_count":7832},{"key":"996-999","doc_count":5552},{"key":"221-230","doc_count":3902},{"key":"231-249","doc_count":3052},{"key":"275-279","doc_count":1885},{"key":"220","doc_count":1295},{"key":"250-259","doc_count":394},{"key":"200-209","doc_count":344}]}},{"key":"F","doc_count":1299568,"group_chart_0_hispanicOrigin":{"doc_count_error_upper_bound":0,"sum_other_doc_count":0,"buckets":[{"key":"100-199","doc_count":1218698},{"key":"210-219","doc_count":42137},{"key":"260-269","doc_count":9937},{"key":"270-274","doc_count":7473},{"key":"280-299","doc_count":7222},{"key":"221-230","doc_count":3677},{"key":"996-999","doc_count":3547},{"key":"231-249","doc_count":3057},{"key":"275-279","doc_count":1978},{"key":"220","doc_count":1191},{"key":"250-259","doc_count":357},{"key":"200-209","doc_count":294}]}}]}}}
        var result = searchUtils.populateDataWithMappings(response, 'deaths');
        should(result.data.nested.table.hispanicOrigin[0].deaths).equal('suppressed');
        done()
    });

    it('Apply suppression rules to population totals', function(done) {
        var response = {"took":592,"timed_out":false,"_shards":{"total":5,"successful":5,"failed":0},"hits":{"total":2630800,"max_score":0,"hits":[]},"aggregations":{"group_table_hispanicOrigin":{"doc_count_error_upper_bound":0,"sum_other_doc_count":0,"buckets":[{"key":"100-199","doc_count":1223456,"group_table_gender":{"doc_count_error_upper_bound":0,"sum_other_doc_count":0,"buckets":[{"key":"M","doc_count":6,"group_table_race":{"doc_count_error_upper_bound":0,"sum_other_doc_count":0,"buckets":[{"key":"1","pop": {value: 1},"doc_count":1},{"key":"2","pop": {value: 6},"doc_count":1},{"key":"4","pop": {value: 7},"doc_count":3},{"key":"-9","doc_count":1}]}},{"key":"F","doc_count":1218698,"group_table_race":{"doc_count_error_upper_bound":0,"sum_other_doc_count":0,"buckets":[{"key":"1","pop": {value: 210},"doc_count":1032222},{"key":"2","pop": {value: 1},"doc_count":149107},{"key":"4","pop": {value: 1},"doc_count":29566},{"key":"3","pop": {value: 1},"doc_count":7803}]}}]}},{"key":"210-219","doc_count":96451,"group_table_gender":{"doc_count_error_upper_bound":0,"sum_other_doc_count":0,"buckets":[{"key":"M","doc_count":54314,"group_table_race":{"doc_count_error_upper_bound":0,"sum_other_doc_count":0,"buckets":[{"key":"1","pop": {value: 1},"doc_count":53574},{"key":"2","pop": {value: 1},"doc_count":305},{"key":"3","pop": {value: 2},"doc_count":298},{"key":"4","pop": {value: 2},"doc_count":137}]}},{"key":"F","doc_count":42137,"group_table_race":{"doc_count_error_upper_bound":0,"sum_other_doc_count":0,"buckets":[{"key":"1","pop": {value: 2},"doc_count":41619},{"key":"2","pop": {value: 2},"doc_count":234},{"key":"3","pop": {value: 2},"doc_count":214},{"key":"4","pop": {value: 2},"doc_count":70}]}}]}}]},"group_maps_0_states":{"doc_count_error_upper_bound":0,"sum_other_doc_count":0,"buckets":[{"key":"NY","doc_count":53107,"group_maps_0_sex":{"doc_count_error_upper_bound":0,"sum_other_doc_count":0,"buckets":[{"key":"M","pop": {value: 2},"doc_count":27003},{"key":"F","pop": {value: 2},"doc_count":26104}]}},{"key":"MT","doc_count":53060,"group_maps_0_sex":{"doc_count_error_upper_bound":0,"sum_other_doc_count":0,"buckets":[{"key":"M","pop": {value: 2},"doc_count":26800},{"key":"F","pop": {value: 2},"doc_count":26260}]}}]},"group_chart_0_gender":{"doc_count_error_upper_bound":0,"sum_other_doc_count":0,"buckets":[{"key":"M","doc_count":1331232,"group_chart_0_hispanicOrigin":{"doc_count_error_upper_bound":0,"sum_other_doc_count":0,"buckets":[{"key":"100-199","pop": {value: 2},"doc_count":1232427},{"key":"210-219","pop": {value: 2},"doc_count":54314},{"key":"260-269","pop": {value: 2},"doc_count":11893},{"key":"280-299","pop": {value: 2},"doc_count":8342},{"key":"270-274","pop": {value: 2},"doc_count":7832},{"key":"996-999","pop": {value: 2},"doc_count":5552},{"key":"221-230","pop": {value: 2},"doc_count":3902},{"key":"231-249","pop": {value: 2},"doc_count":3052},{"key":"275-279","pop": {value: 2},"doc_count":1885},{"key":"220","pop": {value: 2},"doc_count":1295},{"key":"250-259","pop": {value: 2},"doc_count":394},{"key":"200-209","pop": {value: 2},"doc_count":344}]}},{"key":"F","doc_count":1299568,"group_chart_0_hispanicOrigin":{"doc_count_error_upper_bound":0,"sum_other_doc_count":0,"buckets":[{"key":"100-199","pop": {value: 2},"doc_count":1218698},{"key":"210-219","pop": {value: 2},"doc_count":42137},{"key":"260-269","pop": {value: 2},"doc_count":9937},{"key":"270-274","pop": {value: 2},"doc_count":7473},{"key":"280-299","pop": {value: 2},"doc_count":7222},{"key":"221-230","pop": {value: 2},"doc_count":3677},{"key":"996-999","pop": {value: 2},"doc_count":3547},{"key":"231-249","pop": {value: 2},"doc_count":3057},{"key":"275-279","pop": {value: 2},"doc_count":1978},{"key":"220","pop": {value: 2},"doc_count":1191},{"key":"250-259","pop": {value: 2},"doc_count":357},{"key":"200-209","pop": {value: 2},"doc_count":294}]}}]}}};
        var result = searchUtils.populateDataWithMappings(response, 'pop');
        should(result.data.nested.table.hispanicOrigin[0].pop).equal('suppressed');
        done()
    });

    it('Apply suppression rules to death count totals', function(done) {
        var response = {"took":592,"timed_out":false,"_shards":{"total":5,"successful":5,"failed":0},"hits":{"total":2630800,"max_score":0,"hits":[]},"aggregations":{"group_table_hispanicOrigin":{"doc_count_error_upper_bound":0,"sum_other_doc_count":0,"buckets":[{"key":"100-199","doc_count":1223456,"group_table_gender":{"doc_count_error_upper_bound":0,"sum_other_doc_count":0,"buckets":[{"key":"M","doc_count":6,"group_table_race":{"doc_count_error_upper_bound":0,"sum_other_doc_count":0,"buckets":[{"key":"1","pop": {value: 1},"doc_count":7},{"key":"2","pop": {value: 6},"doc_count":8},{"key":"4","pop": {value: 7},"doc_count":9},{"key":"-9","doc_count":1}]}},{"key":"F","doc_count":1218698,"group_table_race":{"doc_count_error_upper_bound":0,"sum_other_doc_count":0,"buckets":[{"key":"1","pop": {value: 210},"doc_count":1032222},{"key":"2","pop": {value: 1},"doc_count":149107},{"key":"4","pop": {value: 1},"doc_count":29566},{"key":"3","pop": {value: 1},"doc_count":7803}]}}]}},{"key":"210-219","doc_count":96451,"group_table_gender":{"doc_count_error_upper_bound":0,"sum_other_doc_count":0,"buckets":[{"key":"M","doc_count":54314,"group_table_race":{"doc_count_error_upper_bound":0,"sum_other_doc_count":0,"buckets":[{"key":"1","pop": {value: 1},"doc_count":53574},{"key":"2","pop": {value: 1},"doc_count":305},{"key":"3","pop": {value: 2},"doc_count":298},{"key":"4","pop": {value: 2},"doc_count":137}]}},{"key":"F","doc_count":42137,"group_table_race":{"doc_count_error_upper_bound":0,"sum_other_doc_count":0,"buckets":[{"key":"1","pop": {value: 2},"doc_count":41619},{"key":"2","pop": {value: 2},"doc_count":234},{"key":"3","pop": {value: 2},"doc_count":214},{"key":"4","pop": {value: 2},"doc_count":70}]}}]}}]},"group_maps_0_states":{"doc_count_error_upper_bound":0,"sum_other_doc_count":0,"buckets":[{"key":"NY","doc_count":53107,"group_maps_0_sex":{"doc_count_error_upper_bound":0,"sum_other_doc_count":0,"buckets":[{"key":"M","pop": {value: 2},"doc_count":27003},{"key":"F","pop": {value: 2},"doc_count":26104}]}},{"key":"MT","doc_count":53060,"group_maps_0_sex":{"doc_count_error_upper_bound":0,"sum_other_doc_count":0,"buckets":[{"key":"M","pop": {value: 2},"doc_count":26800},{"key":"F","pop": {value: 2},"doc_count":26260}]}}]},"group_chart_0_gender":{"doc_count_error_upper_bound":0,"sum_other_doc_count":0,"buckets":[{"key":"M","doc_count":1331232,"group_chart_0_hispanicOrigin":{"doc_count_error_upper_bound":0,"sum_other_doc_count":0,"buckets":[{"key":"100-199","pop": {value: 2},"doc_count":1232427},{"key":"210-219","pop": {value: 2},"doc_count":54314},{"key":"260-269","pop": {value: 2},"doc_count":11893},{"key":"280-299","pop": {value: 2},"doc_count":8342},{"key":"270-274","pop": {value: 2},"doc_count":7832},{"key":"996-999","pop": {value: 2},"doc_count":5552},{"key":"221-230","pop": {value: 2},"doc_count":3902},{"key":"231-249","pop": {value: 2},"doc_count":3052},{"key":"275-279","pop": {value: 2},"doc_count":1885},{"key":"220","pop": {value: 2},"doc_count":1295},{"key":"250-259","pop": {value: 2},"doc_count":394},{"key":"200-209","pop": {value: 2},"doc_count":344}]}},{"key":"F","doc_count":1299568,"group_chart_0_hispanicOrigin":{"doc_count_error_upper_bound":0,"sum_other_doc_count":0,"buckets":[{"key":"100-199","pop": {value: 2},"doc_count":1218698},{"key":"210-219","pop": {value: 2},"doc_count":42137},{"key":"260-269","pop": {value: 2},"doc_count":9937},{"key":"270-274","pop": {value: 2},"doc_count":7473},{"key":"280-299","pop": {value: 2},"doc_count":7222},{"key":"221-230","pop": {value: 2},"doc_count":3677},{"key":"996-999","pop": {value: 2},"doc_count":3547},{"key":"231-249","pop": {value: 2},"doc_count":3057},{"key":"275-279","pop": {value: 2},"doc_count":1978},{"key":"220","pop": {value: 2},"doc_count":1191},{"key":"250-259","pop": {value: 2},"doc_count":357},{"key":"200-209","pop": {value: 2},"doc_count":294}]}}]}}};
        var result = searchUtils.populateDataWithMappings(response, 'deaths');
        should(result.data.nested.table.hispanicOrigin[0].deaths).equal('suppressed');
        done()
    });

    it('Apply suppression rules to side filter totals', function(done) {
        var sideFilter = {
            'race': [
                {"name": 1, "deaths": 24},
                {"name": 2, "deaths": 30}
            ],
            'gender': [
                {"name": 'M', "deaths": 42},
                {"name": 'F', "deaths": 56}
            ]
        };

        var data = {
            "race": [
                {'name': 1, 'deaths': 5, "gender": [{'name': 'M', 'deaths': 12}, {'name': 'F', 'deaths': 14}]},
                {'name': 2, 'deaths': 'suppressed', "gender": [{'name': 'M', 'deaths': 'suppressed'}, {'name': 'F', 'deaths': 14}]}
            ]
        };
        searchUtils.suppressSideFilterTotals(sideFilter, data);
        should(sideFilter['race'][1]['deaths']).equal('suppressed');
        should(sideFilter['gender'][0]['deaths']).equal('suppressed');
        done();
    });

    it("Populate YRBS results with headers ", function(done){
        var response = [{"_index":"owh","_type":"yrbs","_id":"28093","_score":1,"_source":{"count":"15555","primary_filter":"race","nhopi":{"count":"97","lower_confidence":"N/A","percent":"N/A","upper_confidence":"N/A"},"question":{"category":"Unintentional Injuries and Violence","path":["Unintentional Injuries and Violence","Riding with a drinking driver"],"key":"Riding with a drinking driver","label":"Rode with a driver who had been drinking alcohol(in a car or other vehicle one or more times during the 30 days before the survey)"},"lower_confidence":"18.4","percent":"20.0","ai_an":{"count":"161","lower_confidence":"16.8","percent":"25.3","upper_confidence":"36.2"},"grade":"all","black_african_american":{"count":"1655","lower_confidence":"17.2","percent":"21.1","upper_confidence":"25.6"},"hispanic":{"count":"5101","lower_confidence":"24.4","percent":"26.2","upper_confidence":"28.2"},"race":"all-races-ethnicities","asian":{"count":"625","lower_confidence":"7.8","percent":"11.2","upper_confidence":"15.8"},"year":"2015","multiple_race":{"count":"738","lower_confidence":"15.7","percent":"19.6","upper_confidence":"24.2"},"white":{"count":"6837","lower_confidence":"15.9","percent":"17.7","upper_confidence":"19.6"},"sex":"both","upper_confidence":"21.6"}},{"_index":"owh","_type":"yrbs","_id":"28098","_score":1,"_source":{"count":"15468","primary_filter":"race","nhopi":{"count":"99","lower_confidence":"N/A","percent":"N/A","upper_confidence":"N/A"},"question":{"category":"Unintentional Injuries and Violence","path":["Unintentional Injuries and Violence","Weapon carrying at school"],"key":"Weapon carrying at school","label":"Carried a weapon on school property(such as, a gun, knife, or club, on at least 1 day during the 30 days before the survey)"},"lower_confidence":"3.5","percent":"4.1","ai_an":{"count":"160","lower_confidence":"6.4","percent":"10.5","upper_confidence":"16.7"},"grade":"all","black_african_american":{"count":"1642","lower_confidence":"2.3","percent":"3.4","upper_confidence":"5.1"},"hispanic":{"count":"5064","lower_confidence":"3.5","percent":"4.5","upper_confidence":"5.8"},"race":"all-races-ethnicities","asian":{"count":"620","lower_confidence":"1.1","percent":"2.3","upper_confidence":"4.5"},"year":"2015","multiple_race":{"count":"733","lower_confidence":"3.3","percent":"5.7","upper_confidence":"9.7"},"white":{"count":"6814","lower_confidence":"2.9","percent":"3.7","upper_confidence":"4.6"},"sex":"both","upper_confidence":"4.7"}}];
        var headers = [{"key":"ai_an","title":"American Indian or Alaska Native"},{"key":"asian","title":"Asian"},{"key":"black_african_american","title":"Black or African American"},{"key":"hispanic","title":"Hispanic or Latino"},{"key":"nhopi","title":"Native Hawaiian or Other Pacific Islander"},{"key":"white","title":"White"},{"key":"multiple_race","title":"Multiple Race"}];
        var aggregations = [{"key":"question","queryKey":"question.key","size":100000},{"key":"yrbsRace","queryKey":"race","size":100000,"isPrimary":true}];
        var result = searchUtils.populateYRBSData(response, headers, aggregations)
        should(result).have.properties('table');
        done()
    });

    it('Merge age adjusted death rates', function(done) {
        var wonderResponse = { 'American Indian or Alaska Native':
            { Female: { ageAdjustedRate: '562.5' },
                Male: { ageAdjustedRate: '760.8' },
                Total: { ageAdjustedRate: '652.8' } },
                'Asian or Pacific Islander':
                { Female: { ageAdjustedRate: '371.3' },
                    Male: { ageAdjustedRate: '530.0' },
                    Total: { ageAdjustedRate: '439.3' } },
                'Black or African American':
                { Female: { ageAdjustedRate: '814.8' },
                    Male: { ageAdjustedRate: '1,205.6' },
                    Total: { ageAdjustedRate: '976.7' } },
                White:
                { Female: { ageAdjustedRate: '662.5' },
                    Male: { ageAdjustedRate: '927.0' },
                    Total: { ageAdjustedRate: '780.1' } },
                Total: { ageAdjustedRate: '789.7' }
            };

        var mortalityResponse = {"race":[{"name":"American Indian","deaths":217457,"gender":[{"name":"Female","deaths":98841,"pop":28544528},{"name":"Male","deaths":118616,"pop":28645741}],"pop":57190269},{"name":"Asian or Pacific Islander","deaths":710612,"gender":[{"name":"Female","deaths":338606,"pop":121309960},{"name":"Male","deaths":372006,"pop":112325576}],"pop":233635536},{"name":"Black","deaths":4381340,"gender":[{"name":"Female","deaths":2150095,"pop":317237591},{"name":"Male","deaths":2231245,"pop":289840863}],"pop":607078454},{"name":"White","deaths":31820569,"gender":[{"name":"Female","deaths":16104129,"pop":1828192603},{"name":"Male","deaths":15716440,"pop":1787480522}],"pop":3615673125}]};
        var result = {"race":[{"name":"American Indian","deaths":217457,"gender":[{"name":"Female","deaths":98841,"pop":28544528,"ageAdjustedRate":"562.5"},{"name":"Male","deaths":118616,"pop":28645741,"ageAdjustedRate":"760.8"}],"pop":57190269,"ageAdjustedRate":"652.8"},{"name":"Asian or Pacific Islander","deaths":710612,"gender":[{"name":"Female","deaths":338606,"pop":121309960,"ageAdjustedRate":"371.3"},{"name":"Male","deaths":372006,"pop":112325576,"ageAdjustedRate":"530.0"}],"pop":233635536,"ageAdjustedRate":"439.3"},{"name":"Black","deaths":4381340,"gender":[{"name":"Female","deaths":2150095,"pop":317237591,"ageAdjustedRate":"814.8"},{"name":"Male","deaths":2231245,"pop":289840863,"ageAdjustedRate":"1,205.6"}],"pop":607078454,"ageAdjustedRate":"976.7"},{"name":"White","deaths":31820569,"gender":[{"name":"Female","deaths":16104129,"pop":1828192603,"ageAdjustedRate":"662.5"},{"name":"Male","deaths":15716440,"pop":1787480522,"ageAdjustedRate":"927.0"}],"pop":3615673125,"ageAdjustedRate":"780.1"}]};
        searchUtils.mergeAgeAdjustedRates(mortalityResponse, wonderResponse);
        should(JSON.stringify(mortalityResponse)).equal(JSON.stringify(result));
        done();

    });
});

describe('ElasticClient', function(){
    it('should merge populations into mortality response', function(done){
        var mort =   {"data":{"nested":{"table":{"group_table_race":[{"name":"1","deaths":2106697,"undefined":[{"name":"F","deaths":1079109},{"name":"M","deaths":1027588}]},{"name":"2","deaths":291706,"undefined":[{"name":"M","deaths":148258},{"name":"F","deaths":143448}]}]}}}};
        var census = {"data":{"nested":{"table":{"group_table_race":[{"name":"2","undefined":[{"name":"F","pop":4444},{"name":"M","pop":3333}]},{"name":"1","undefined":[{"name":"M","pop":5555},{"name":"F","pop":6666}]}]}}}};
        var mergedData = {"data":{"nested":{"table":{"group_table_race":[{"name":"1","deaths":2106697,"undefined":[{"name":"F","deaths":1079109, "pop":6666},{"name":"M","deaths":1027588,"pop":5555 }]},{"name":"2","deaths":291706,"undefined":[{"name":"F","deaths":143448, "pop":4444},{"name":"M","deaths":148258, "pop":3333}]}]}}}};
        var es = new elasticSearch();
        
        es.mergeWithCensusData(mort, census);
        should(JSON.stringify(mort)).equal(JSON.stringify(mergedData));
        done();
    });
});
