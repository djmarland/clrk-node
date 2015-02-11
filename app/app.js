"use strict";

var fs = require('fs');
var express = require('express');
var favicon = require('serve-favicon');
var passport = require('passport');
var config = require('config/config');

var app = express();

// Setup favicon location (to prevent the logs filling with 404s)
app.use(favicon(__dirname + '/public/favicon.ico'));

// Bootstrap models
require('models');

// Bootstrap utils
require('utils');

// Bootstrap passport config
require('config/passport')(passport, config);

// Bootstrap application settings
require('config/express')(app, passport);


// Bootstrap routes
require('config/routes')(app, passport);

module.exports = app;
