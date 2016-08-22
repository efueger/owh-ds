/*
const util = require('util');
var Q = require('q');
var rio = require("rio");

//model for connecting RServe
var RServeClient = function() {
};

RServeClient.prototype.query = function(config) {
    var cfg = {
        command : "pi / 2 * 2",
        filename : "",
        entrypoint: "",
        data: []
    };
    if (config) {
        cfg.host = config.host;
        cfg.port = config.port;
        cfg.user = config.user;
        cfg.password = config.password;
    } else {
        cfg.host = "54.175.233.200";
        cfg.port = 6311;
        cfg.user = "rserv";
        cfg.password = "OWH16#@rserv";
    }

    rio.$e(cfg).then(function (res) {
        console.log("In rserve log");
        console.log(res);
    }).catch( function (err) {
        console.log(err);
        console.log("In Error");
    });
    console.log("Completed query")
};

module.exports = RServeClient;*/
