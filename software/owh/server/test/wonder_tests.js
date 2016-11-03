var wonder = require("../api/wonder");
var supertest = require("supertest");
var expect = require("expect.js");

describe("WONDER API", function () {
    var w;
    this.timeout(5000);
    beforeEach( function () {
        w = new wonder('D76');
    });

    it("invoke wonder API default query (group by 2)", function (){
        var startTime = new Date();
        query = {"searchFor":"deaths","query":{"current_year":{"key":"year","queryKey":"current_year","value":["2014"],"primary":false}},
                 "aggregations":{"simple":[],"nested":{"table":[{"key":"race","queryKey":"race","size":100000},{"key":"gender","queryKey":"sex","size":100000}]}}}
        return w.invokeWONDER(query).then(function (resp) {
            var duration = new Date() - startTime;
            console.log("invoke wonder API default query duration: "+duration);
            expect(resp).deep.equal({ 'American Indian or Alaska Native':
            { Female: { ageAdjustedRate: '514.1' },
                Male: { ageAdjustedRate: '685.4' },
                Total: { ageAdjustedRate: '594.1' } },
                'Asian or Pacific Islander':
                { Female: { ageAdjustedRate: '331.1' },
                    Male: { ageAdjustedRate: '462.0' },
                    Total: { ageAdjustedRate: '388.3' } },
                'Black or African American':
                { Female: { ageAdjustedRate: '713.3' },
                    Male: { ageAdjustedRate: '1,034.0' },
                    Total: { ageAdjustedRate: '849.3' } },
                White:
                { Female: { ageAdjustedRate: '617.6' },
                    Male: { ageAdjustedRate: '853.4' },
                    Total: { ageAdjustedRate: '725.4' } },
                Total: { ageAdjustedRate: '724.6' } });
                expect(duration).to.be.at.most(2000);
        }, function(err){
            console.log(err);
            expect(err).to.be.undefined();
        });
    });

    it("invoke wonder API query (group by 3)", function (){
        query = {"searchFor":"deaths","query":{"current_year":{"key":"year","queryKey":"current_year","value":["2014","2013"],"primary":false}},
                  "aggregations":{"simple":[],"nested":{"table":[{"key":"race","queryKey":"race","size":100000},
                                                                 {"key":"gender","queryKey":"sex","size":100000},
                                                                 {"key":"hispanicOrigin","queryKey":"hispanic_origin","size":100000}]}}}
        var startTime = new Date();
        return w.invokeWONDER(query).then(function (resp) {
            var duration = new Date() - startTime;
            console.log("invoke wonder API query (group by 3) duration: "+duration);
            expect(resp).to.deep.equal( { 'American Indian or Alaska Native':
            { Female:
            { 'Hispanic or Latino': { ageAdjustedRate: '79.3' },
                'Not Hispanic or Latino': { ageAdjustedRate: '671.9' },
                'Not Stated': { ageAdjustedRate: 'Not Applicable' },
                Total: { ageAdjustedRate: '511.2' } },
                Male:
                { 'Hispanic or Latino': { ageAdjustedRate: '107.9' },
                    'Not Hispanic or Latino': { ageAdjustedRate: '932.6' },
                    'Not Stated': { ageAdjustedRate: 'Not Applicable' },
                    Total: { ageAdjustedRate: '687.1' } },
                Total: { ageAdjustedRate: '592.9' } },
                'Asian or Pacific Islander':
                { Female:
                { 'Hispanic or Latino': { ageAdjustedRate: '202.1' },
                    'Not Hispanic or Latino': { ageAdjustedRate: '338.9' },
                    'Not Stated': { ageAdjustedRate: 'Not Applicable' },
                    Total: { ageAdjustedRate: '336.9' } },
                    Male:
                    { 'Hispanic or Latino': { ageAdjustedRate: '292.2' },
                        'Not Hispanic or Latino': { ageAdjustedRate: '476.7' },
                        'Not Stated': { ageAdjustedRate: 'Not Applicable' },
                        Total: { ageAdjustedRate: '474.4' } },
                    Total: { ageAdjustedRate: '396.5' } },
                'Black or African American':
                { Female:
                { 'Hispanic or Latino': { ageAdjustedRate: '169.6' },
                    'Not Hispanic or Latino': { ageAdjustedRate: '735.8' },
                    'Not Stated': { ageAdjustedRate: 'Not Applicable' },
                    Total: { ageAdjustedRate: '716.9' } },
                    Male:
                    { 'Hispanic or Latino': { ageAdjustedRate: '236.1' },
                        'Not Hispanic or Latino': { ageAdjustedRate: '1,071.6' },
                        'Not Stated': { ageAdjustedRate: 'Not Applicable' },
                        Total: { ageAdjustedRate: '1,043.2' } },
                    Total: { ageAdjustedRate: '855.0' } },
                White:
                { Female:
                { 'Hispanic or Latino': { ageAdjustedRate: '466.8' },
                    'Not Hispanic or Latino': { ageAdjustedRate: '636.1' },
                    'Not Stated': { ageAdjustedRate: 'Not Applicable' },
                    Total: { ageAdjustedRate: '620.6' } },
                    Male:
                    { 'Hispanic or Latino': { ageAdjustedRate: '667.7' },
                        'Not Hispanic or Latino': { ageAdjustedRate: '874.5' },
                        'Not Stated': { ageAdjustedRate: 'Not Applicable' },
                        Total: { ageAdjustedRate: '856.3' } },
                    Total: { ageAdjustedRate: '728.2' } },
                Total: { ageAdjustedRate: '728.2' } });
            expect(duration).to.be.at.most(2000);
        }, function(err){
            console.log(err);
            expect(err).to.be.undefined();
        });
    })

    it("invoke wonder API bigger query (group by 5)", function (){
        query = {"searchFor":"deaths","query":{},
                 "aggregations":{"simple":[],"nested":{"table":[{"key":"race","queryKey":"race","size":100000},
                                                                {"key":"placeofdeath","queryKey":"place_of_death","size":100000},
                                                                {"key":"hispanicOrigin","queryKey":"hispanic_origin","size":100000},
                                                                {"key":"gender","queryKey":"sex","size":100000},
                                                                {"key":"weekday","queryKey":"week_of_death","size":100000}],
                                                                "charts":[[{"key":"race","queryKey":"race","size":100000},{"key":"hispanicOrigin","queryKey":"hispanic_origin","size":100000}],[{"key":"gender","queryKey":"sex","size":100000},{"key":"race","queryKey":"race","size":100000}],[{"key":"gender","queryKey":"sex","size":100000},{"key":"placeofdeath","queryKey":"place_of_death","size":100000}],[{"key":"gender","queryKey":"sex","size":100000},{"key":"hispanicOrigin","queryKey":"hispanic_origin","size":100000}]],"maps":[[{"key":"states","queryKey":"state","size":100000},{"key":"sex","queryKey":"sex","size":100000}]]}}}
        var startTime = new Date();
        return w.invokeWONDER(query).then(function (resp) {
            var duration = new Date() - startTime;
            console.log("invoke wonder API bigger query (group by 5) duration: "+duration);
            expect(resp).to.not.be(undefined);
            expect(duration).to.be.at.most(2000);
        }, function(err){
            console.log(err);
            expect(err).to.be.undefined();
        });
    })

})