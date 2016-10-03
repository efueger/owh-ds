require('rio')


/**
 * Execute the given R script on the remote rserve and return the results
 * @param script R language script to execute
 * @returns results from the executed script
 */
var executeRScript = function (script){
    return undefined
}

/**
 * Executes a R function that is preloaded on the Rserve server and returns the results
 * @param name of the r function to invoke
 * @returns results from the executed R function
 */
var executeRServerFunction = function (functionname){
    return undefined
}

module.exports.executeRScript = executeRScript
module.exports.executeRServerFunction = executeRServerFunction