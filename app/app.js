"use strict";

/**
 * Module dependencies.
 */
    // file system access
var fs          = require('fs'),
    // express app
    express     = require('express'),
    // favicon loading
    favicon     = require('serve-favicon'),
    // login support
    passport    = require('passport'),
    // merging config files
    config      = require('config/config'),

    app = express();

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
