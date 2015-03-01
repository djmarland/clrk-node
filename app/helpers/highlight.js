"use strict";

var Handlebars = require('handlebars');

module.exports = function(text, query) {
    var rg = new RegExp('(' + query + ')',"gi");
    text = Handlebars.Utils.escapeExpression(text);
    if (!query) {
        return text;
    }
    text = text.replace(rg,'<strong>$1</strong>');
    return text;

};