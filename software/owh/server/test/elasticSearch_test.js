var elasticSearch = require('../models/elasticSearch');
var expect = require("expect.js");

describe("Elastic Search", function () {


    beforeEach( function () {
        this.timeout(10000);
    });

    it("Check mortality counts by year", function (){
        new elasticSearch().executeESQuery('owh_mortality', 'mortality',JSON.stringify({"size":0,
                "aggregations":{
                    "group_year":{
                        "terms":{  "field":"current_year","size" :100 ,"order" : { "_term" : "desc" } }
                    }
                }
            })
        ).then(function (resp) {
            expect(resp.aggregations.group_year.buckets[0].doc_count).to.be(2626418);
            expect(resp.aggregations.group_year.buckets[1].doc_count).to.be(2596993);
            expect(resp.aggregations.group_year.buckets[2].doc_count).to.be(1543279);
            expect(resp.aggregations.group_year.buckets[3].doc_count).to.be(2515458);
            expect(resp.aggregations.group_year.buckets[4].doc_count).to.be(2468435);
            expect(resp.aggregations.group_year.buckets[14].doc_count).to.be(2403351);
        })
    })

})