"use strict";

/**
 * Singleton for utils
 */

var fs        = require("fs");
var path      = require("path");
var utils        = {};

fs
    .readdirSync(__dirname)
    .filter(function(file) {
        return (file.indexOf(".") !== 0) && (file !== "index.js");
    })
    .forEach(function(file) {
        var model = new (require(path.join(__dirname, file))),
            name = file.replace('.js','');
        utils[name] = model;
    });

Object.keys(utils).forEach(function(modelName) {
    if ("associate" in utils[modelName]) {
        utils[modelName].associate(utils);
    }
});


module.exports = utils;