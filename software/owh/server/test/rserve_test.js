var rserve = require("../api/rserve");
var expect = require("expect.js");

describe("Rserve", function () {
    it("execute simple R script", function (done){
        var resp = rserve.executeRScript("R.version.string")
        expect(resp).to.be("R version 3.0.2 (2013-09-25)");
        done()
    })

    it("execute R server function", function (done){
        var resp = rserve.executeRServerFunction("testFunction")
        expect(resp).to.be("R version 3.0.2 (2013-09-25)");
        done()
    })
})