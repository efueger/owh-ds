var rio = require("rio");

var rserve = function (inConfig) {
    this.config = inConfig;
};

/**
 * Execute the given R script on the remote rserve and return the promise
 * @param script R language script to execute
 * @returns the promise for the rserve call
 */
rserve.prototype.executeRScript = function (script){
    var newConf = JSON.parse(JSON.stringify(this.config));
    newConf.command = script;
    console.log(newConf);
    return rio.$e(newConf);
};

/**
 * Executes a R function that is preloaded on the Rserve server and returns the promise
 * @param name of the r function to invoke
 * @returns  the promise for the rserve call
 */
rserve.prototype.executeRServerFunction = function (functionname, args){
    var newConf = JSON.parse(JSON.stringify(this.config));
    newConf.entrypoint = functionname;
    newConf.data = args;
    console.log(newConf);
    return rio.$e(newConf);
};

module.exports = rserve;