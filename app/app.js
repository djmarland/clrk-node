"use strict";

var fs = require('fs');
var express = require('express');
var favicon = require('serve-favicon');
var passport = require('passport');
var config = require('config/config');

var app = express();
/*
// Setup database
Sequelize = require('sequelize');
var db = new Sequelize('postgres://root:root@localhost:5432/root');

app = express();
app.set('db', db);
*/

// Setup view renderer (handlebars)




// Setup favicon location (to prevent the logs filling with 404s)
app.use(favicon(__dirname + '/public/favicon.ico'));

// Bootstrap models
require('models');

// Bootstrap passport config
require('config/passport')(passport, config);

// Bootstrap application settings
require('config/express')(app, passport);


// Bootstrap routes
require('./config/routes')(app, passport);

module.exports = app;
