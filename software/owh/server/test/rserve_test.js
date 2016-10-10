var rserve = require("../routes/rserve");
var expect = require("expect.js");

describe("Rserve", function () {
    var r;

    beforeEach( function () {
        r = new rserve();
        this.timeout(5000);
    });

    it("execute simple R script", function (done){
        r.executeRScript("R.version.string").then(function (resp) {
            console.log(resp);
            expect(resp).to.be("R version 3.0.2 (2013-09-25)");
            done();
        });
    })

    it("execute R server function with string arg", function (done){
        var resp = r.executeRServerFunction("testFunctionWithStringArg", 'World').then(function (resp) {
            console.log(resp);
            expect(resp).to.be('Hello "World"');
            done();
        }, function(err){
            console.log(err);
            expect(err).to.be.undefined();
            done();
        });
    })

    it("execute R server function with no arg", function (done){
        var resp = r.executeRServerFunction("testFunctionWithNoArg").then(function (resp) {
            console.log(resp);
            expect(resp).to.be('R version 3.0.2 (2013-09-25)');
            done();
        }, function(err){
            console.log(err);
            expect(err).to.be.undefined();
            done();
        });
    })

    it("execute non-existing R server function", function (done){
        var resp = r.executeRServerFunction("doesnotexist").then(function (resp) {
            console.log(resp);
            expect(resp).to.be.undefined();
            done();
        }, function(err){
            console.log(err);
            expect(err).to.be("Eval failed with error code 127");
            done();
        });
    })

    it("execute simple R script with invalid credentials", function (done){
        var rr = new rserve();
        rr.config.password = 'invalid'
        rr.executeRScript("R.version.string").then(function (resp) {
            expect(resp).to.be.undefined();
            done();
        }, function(err){
            expect(err).to.be("Response with error code 65");
            done();
        });
    })

})