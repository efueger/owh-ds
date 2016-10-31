var wonder = require("../routes/wonder");
var expect = require("expect.js");

describe("WONDER API", function () {
    var r;

    beforeEach( function () {

    });

    it("invoke wonder API default query", function (done){
        var startTime = new Date();
        query = {"searchFor":"deaths","query":{"current_year":{"key":"year","queryKey":"current_year","value":["2014"],"primary":false}},
                 "aggregations":{"simple":[],"nested":{"table":[{"key":"race","queryKey":"race","size":100000},{"key":"gender","queryKey":"sex","size":100000}]}}}
        var resp = wonder.invokeWONDER(query).then(function (resp) {
            var duration = new Date() - startTime;
            expect(resp).to.be(resp);
            expect(duration).to.be.lessThanOrEqual(2000);
            done();
        }, function(err){
            console.log(err);
            expect(err).to.be.undefined();
            done();
        });
    });

    it("invoke wonder API test query", function (done){
        query = {"searchFor":"deaths","query":{"current_year":{"key":"year","queryKey":"current_year","value":["2014"],"primary":false}},
                  "aggregations":{"simple":[],"nested":{"table":[{"key":"race","queryKey":"race","size":100000},{"key":"gender","queryKey":"sex","size":100000},{"key":"hispanicOrigin","queryKey":"hispanic_origin","size":100000}]}}}
        var startTime = new Date();
        var resp = wonder.invokeWONDER(query).then(function (resp) {
            var duration = new Date() - startTime;
            expect(resp).to.be(resp);
            expect(duration).to.be.lessThanOrEqual(2000);
            done();
        }, function(err){
            console.log(err);
            expect(err).to.be.undefined();
            done();
        });
    })

})