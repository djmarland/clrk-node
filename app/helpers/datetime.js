"use strict";


// this will need to be replaced with a front-end compatible library such as Moment.js
var dateFormat = require('dateformat'),
    types = {
        day : "dddd dS mmmm yyyy",
        time : "h:MMtt",
        full : "ddd dS mmm yyyy, h:MMtt"
    };

module.exports = function(date, type) {
    type = (typeof type == 'string') ? type : 'full';
    return dateFormat(date,types[type]);
};