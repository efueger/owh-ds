var rserve = require("../routes/rserve");
var expect = require("expect.js");

// Disable rserve tests as the rserve feautre is no more used
xdescribe("Rserve", function () {
    var r;

    beforeEach( function () {
        r = new rserve();
        this.timeout(10000);
    });

    it("execute simple R script", function (){
        return r.executeRScript("R.version.string").then(function (resp) {
            console.log(resp);
            expect(resp).to.be("R version 3.0.2 (2013-09-25)");
        });
    })

    it("execute R server function with string arg", function (){
        return  r.executeRServerFunction("testFunctionWithStringArg", 'World').then(function (resp) {
            console.log(resp);
            expect(resp).to.be('Hello "World"');
        }, function(err){
            console.log(err);
            expect(err).to.be.undefined();
        });
    })

    it("execute R server function with no arg", function (){
        return r.executeRServerFunction("testFunctionWithNoArg").then(function (resp) {
            console.log(resp);
            expect(resp).to.be('R version 3.0.2 (2013-09-25)');
        }, function(err){
            console.log(err);
            expect(err).to.be.undefined();
        });
    })

    it("execute non-existing R server function", function (){
        return r.executeRServerFunction("doesnotexist").then(function (resp) {
            console.log(resp);
            expect(resp).to.be.undefined();
        }, function(err){
            console.log(err);
            expect(err).to.be("Eval failed with error code 127");
        });
    })

    it("execute simple R script with invalid credentials", function (){
        var rr = new rserve();
        rr.config.password = 'invalid'
        return rr.executeRScript("R.version.string").then(function (resp) {
            expect(resp).to.be.undefined();
        }, function(err){
            expect(err).to.be("Response with error code 65");
        });
    })

})