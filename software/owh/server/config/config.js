//Load application configuration
//Looks for owh-config.yaml in folder specified by OWH_HOME env variable
//if OWH_HOME is not set default the location to $HOME/.owh
var yaml_config = require('node-yaml-config');
var configDir= process.env.OWH_HOME?process.env.OWH_HOME:process.env.HOME + '/.owh'
var config = yaml_config.load(configDir + '/owh-config.yaml');

// A configuration property pointing to the OWH_HOME (explicitly set by user or the default)
config.OWH_HOME = configDir;

module.exports = config;
