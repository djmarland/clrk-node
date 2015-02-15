"use strict";

var Handlebars = require('handlebars');

module.exports = function(text, query) {

    text = Handlebars.Utils.escapeExpression(text);
    return '<strong>' + text + '</strong>';

};