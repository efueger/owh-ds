var rio = require("rio");
var logger = require('../config/logging');

var rserve = function () {
    this.config = require('../config/config.js').rserve
};

/**
 * Execute the given R script on the remote rserve and return the promise
 * @param script R language script to execute
 * @returns the promise for the rserve call
 */
rserve.prototype.executeRScript = function (script){
    var newConf = JSON.parse(JSON.stringify(this.config));
    newConf.command = script;
    logger.debug("Invoking rio with config", newConf);
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
    logger.debug("Invoking rio with config", newConf);
    return rio.$e(newConf);
};

module.exports = rserve;