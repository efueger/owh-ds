var bunyan = require('bunyan');
var config = require('./config');
module.exports = bunyan.createLogger({
    // Writes daily rotating logs in folder $OWH_HOME/logs
    name: 'owh',
    type: 'rotating-file',
    period: '1d',
    path: config.OWH_HOME+'/logs/owh.log',
    level: config.logging.level
});