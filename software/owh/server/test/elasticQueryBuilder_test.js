var elasticQueryBuilder = require("../api/elasticQueryBuilder");
var supertest = require("supertest");
var expect = require("expect.js");

describe("Build elastic search queries", function(){
     it("Build search query with empty query and aggregations", function(done){
        var params = {query:{}, aggregations:{}};
        var result = elasticQueryBuilder.buildSearchQuery(params, true)
        var query = result[0];
        expect(JSON.stringify(query.aggregations)).equal("{}");
        expect(query.size).equal(0);
        console.log(" result 1 ", result[1]);
        expect(result[1]).equal(undefined);
        done()
    });

    it("Build search query with empty query and simple aggregations", function(done){
        var params = {query:{}, aggregations:{ simple:[{ key:"year", queryKey:"current_year", size:100000}]}};
        var result = elasticQueryBuilder.buildSearchQuery(params, true);
        var query = result[0];
        expect(JSON.stringify(query.aggregations)).equal(JSON.stringify({"year":{"terms":{"field":"current_year","size":100000}}}));
        expect(query.size).equal(0);
        expect(query.query).to.not.equal(undefined);
        expect(result[1]).equal(undefined);
        done()
    });

     it("Build search query with empty query and simple and nested aggregations", function(done){
        var params = {query:{}, aggregations:{ simple:[{ key:"year", queryKey:"current_year", size:100000}], nested:[]}};
        var query = elasticQueryBuilder.buildSearchQuery(params, true)[0];
        expect(JSON.stringify(query.aggregations)).equal(JSON.stringify({"year":{"terms":{"field":"current_year","size":100000}}}));
        expect(query.size).equal(0);
        expect(query.query).to.not.equal(undefined);
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
        expect(query.aggregations).to.have.property('year');
        expect(query.aggregations).to.have.property('group_table_gender');
        expect(query.aggregations).to.have.property('group_chart_0_gender');
        expect(query.aggregations).to.have.property('group_maps_0_states');
        expect(query.aggregations.group_table_gender.aggregations).to.have.property('group_table_race');
        expect(query.aggregations.group_table_gender.aggregations.group_table_race.aggregations).to.have.property('group_table_year');
        expect(query.size).equal(0);
        expect(query).to.have.property('query');
        expect(query).to.have.property('size');
        expect(censusQuery).to.not.equal(undefined);
        expect(censusQuery.aggregations).to.have.property('group_table_gender');
        expect(censusQuery.aggregations.group_table_gender.aggregations).to.have.property('group_table_race');
        expect(censusQuery.aggregations.group_table_gender.aggregations.group_table_race.aggregations).to.have.property('group_table_year');
        expect(censusQuery.aggregations.group_table_gender.aggregations.group_table_race.aggregations.group_table_year.aggregations).to.have.property('pop');
        expect(censusQuery.aggregations.group_table_gender.aggregations.group_table_race.aggregations.group_table_year.aggregations.pop.sum.field).equal("pop");
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
        expect(query.aggregations).to.have.property('year');
        expect(query.aggregations).to.have.property('group_table_gender');
        expect(query.aggregations).to.have.property('group_chart_0_gender');
        expect(query.aggregations).to.have.property('group_count_pop');
        expect(query.aggregations.group_table_gender.aggregations).to.have.property('group_table_race');
        expect(query.aggregations.group_chart_0_gender.aggregations).to.have.property('group_chart_0_race');
        expect(query.aggregations.group_table_gender.aggregations.group_table_race.aggregations).to.have.property('group_table_year');
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
        var queryZero = {"filtered":{"query":{"bool":{"must":[{"bool":{"should":[{"match":{"race":"1"}}]}},{"bool":{"should":[{"range":{"start_date":{"gte":"M","lte":"M"}}}]}},{"bool":{"should":[{"match":{"autopsy_data":"n"}}]}},{"bool":{}}]}},"filter":{"bool":{"must":[{"bool":{"should":[{"term":{"current_year":"2014"}}]}},{"bool":{"should":[{"term":{"gender":"m"}}]}},{"bool":{"should":[{"range":{"start_date":{"lte":"now"}}}]}},{"bool":{"should":[{"term":{"week_of_death":"6"}}]}},{"bool":{"should":[{"term":{"month_of_death":"12"}}]}}]}}}}
        expect(query[0]).to.not.equal(undefined);
        expect(JSON.stringify(query[0].query)).to.equal(JSON.stringify(queryZero));
        expect(query[1]).equal(undefined);
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
        console.log("query zero ", JSON.stringify(query[0]));
        var queryZero = {"filtered":{"query":{"bool":{"must":[]}},"filter":{"bool":{"must":[{"bool":{"should":[{"term":{"current_year":"2014"}}]}},{"bool":{"should":[{"term":{"gender":"m"}}]}},{"bool":{"should":[{"range":{"start_date":{"lte":"now"}}}]}},{"bool":{"should":[{"term":{"week_of_death":"6"}}]}}]}}}};
        expect(query[0]).to.not.equal(undefined);
        expect(JSON.stringify(query[0].query)).to.equal(JSON.stringify(queryZero));
        expect(query[1]).equal(undefined);
        done()
    });


    it("Build search query with empty invalid query key", function(done){
        var params = {
            "query":{
                "current_year":{"key":"year","queryKey": new Object(),"value":"2014","primary":false, caseChange:false}
            }, aggregations:{}, pagination:{from:0, size:0}};
        var query = elasticQueryBuilder.buildSearchQuery(params, false);
        console.log("query zero ", JSON.stringify(query[0]));
        var queryZero = {"filtered":{"query":{"bool":{"must":[]}},"filter":{"bool":{"must":[{"bool":{}}]}}}};
        expect(query[0]).to.not.equal(undefined);
        expect(JSON.stringify(query[0].query)).to.equal(JSON.stringify(queryZero));
        expect(query[1]).equal(undefined);
        done()
    });

     it("getGroupQuery returns query with size 0", function(done){
        var filter = {"key":"year","queryKey": "current_year","value":"2014","primary":false};
        var query = elasticQueryBuilder.getGroupQuery(filter);
        expect(JSON.stringify(query)).equal(JSON.stringify({key: "year", queryKey: "current_year", getPercent: undefined, size: 0}));
        done()
    });

     it("prepareMapAggregations returns query with size 0", function(done){
        var query = elasticQueryBuilder.prepareMapAggregations();
        expect(JSON.stringify(query)).equal(JSON.stringify([[{ key: 'states', queryKey: 'state', size: 0 },{ key: 'sex', queryKey: 'sex', size: 0 }]]));
        done()
    });

    it("add filters to calculate fertility rates", function(done){
        var topLevelQuery = {
            "size":0,"aggregations":{"group_table_race":{"terms":{"field":"race","size":0},"aggregations":{"pop":{"sum":{"field":"pop"}}}}},
            "query":{
                "filtered":{
                    "query":{"bool":{"must":[]}},
                    "filter":{"bool":{"must":[{"bool":{"should":[{"term":{"current_year":"2011"}}]}}]}}
                }
            }
        };
        var expectedQuery = {"size":0,"aggregations":{"group_table_race":{"terms":{"field":"race","size":0},"aggregations":{"pop":{"sum":{"field":"pop"}}}}},
                                "query":{
                                    "filtered":
                                    {
                                        "query":{"bool":{"must":[]}},
                                        "filter":{"bool":{"must":[{"bool":{"should":[{"term":{"current_year":"2011"}}]}},
                                                                  {"bool":{"should":[{"term":{"age":"15"}},{"term":{"age":"16"}},{"term":{"age":"17"}},{"term":{"age":"18"}},{"term":{"age":"19"}},{"term":{"age":"20"}},{"term":{"age":"21"}},{"term":{"age":"22"}},{"term":{"age":"23"}},{"term":{"age":"24"}},{"term":{"age":"25"}},{"term":{"age":"26"}},{"term":{"age":"27"}},{"term":{"age":"28"}},{"term":{"age":"29"}},{"term":{"age":"30"}},{"term":{"age":"31"}},{"term":{"age":"32"}},{"term":{"age":"33"}},{"term":{"age":"34"}},{"term":{"age":"35"}},{"term":{"age":"36"}},{"term":{"age":"37"}},{"term":{"age":"38"}},{"term":{"age":"37"}},{"term":{"age":"38"}},{"term":{"age":"39"}},{"term":{"age":"40"}},{"term":{"age":"41"}},{"term":{"age":"42"}},{"term":{"age":"43"}},{"term":{"age":"44"}}]}},
                                                                  {"bool":{"should":[{"term":{"sex":"Female"}}]}}]}
                                        }
                                    }
                                }
                            };
        var updatedQuery = elasticQueryBuilder.addFiltersToCalcFertilityRates(topLevelQuery);
        expect(JSON.stringify(updatedQuery)).equal(JSON.stringify(expectedQuery));
        done()
    });

    it("add filters to calculate fertility rates with mother_age_r9 filter", function(done){
        var topLevelQuery = {
            "size":0,"aggregations":{"group_table_race":{"terms":{"field":"race","size":0},"aggregations":{"pop":{"sum":{"field":"pop"}}}}},
            "query":{
                "filtered":{
                    "query":{"bool":{"must":[]}},
                    "filter":{"bool":{"must":[{"bool":{"should":[{"term":{"current_year":"2011"}}]}},
                                              {"bool":{"should":[{"term":{"mother_age_r9":"15-19 years"}}]}}]}}
                }
            }
        };
        var expectedQuery = {"size":0,"aggregations":{"group_table_race":{"terms":{"field":"race","size":0},"aggregations":{"pop":{"sum":{"field":"pop"}}}}},
                                    "query":
                                        {
                                          "filtered":
                                                {
                                                    "query":
                                                        {"bool":{"must":[]}},"filter":{"bool":{"must":[{"bool":{"should":[{"term":{"current_year":"2011"}}]}},
                                                                                      {"bool":{"should":[{"term":{"mother_age_r9":"15-19 years"}}]}},
                                                                                      {"bool":{"should":[{"term":{"sex":"Female"}}]}}]}}
                                                }
                                        }
                            };
        var updatedQuery = elasticQueryBuilder.addFiltersToCalcFertilityRates(topLevelQuery);
        expect(JSON.stringify(updatedQuery)).equal(JSON.stringify(expectedQuery));
        done()
    });
});