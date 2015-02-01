"use strict";

// Dependencies
var express = require('express');

var session = require('express-session');
var exphbs  = require('express-handlebars');
var compression = require('compression');
var cookieParser = require('cookie-parser');
var cookieSession = require('cookie-session');
var bodyParser = require('body-parser');
var methodOverride = require('method-override');
var csrf = require('csurf');

var config = require('config/config');
var pkg = require('../package.json');

var env = process.env.NODE_ENV || 'development';

/**
 * Expose
 */

module.exports = function (app, passport) {

    // Compression middleware (should be placed before express.static)
    app.use(compression({
        threshold: 512
    }));

    // Static files middleware
    app.use(express.static(config.root + '/public'));


    // Handlebars templating engine settings
    if (env === 'development' || env === 'test') {
        /*swig.setDefaults({
            cache: false
        });*/
    }

    app.engine('handlebars', exphbs({defaultLayout: 'main'}));
    app.set('views', config.root + '/views');
    app.set('view engine', 'handlebars');

    // expose package.json to views
    app.use(function (req, res, next) {
        res.locals.pkg = pkg;
        res.locals.env = env;
        next();
    });

    // bodyParser should be above methodOverride
    app.use(bodyParser.json());
    app.use(bodyParser.urlencoded({
        extended: false
    }));

    app.use(methodOverride(function (req, res) {
        if (req.body && typeof req.body === 'object' && '_method' in req.body) {
            // look in urlencoded POST bodies and delete it
            var method = req.body._method;
            delete req.body._method;
            return method;
        }
    }));

    // cookieParser should be above session
    app.use(cookieParser());
    app.use(cookieSession({ secret: 'secret' }));
    app.use(session({
        secret: pkg.name,
        resave: false,
        saveUninitialized: true,
        store: null /*new dbStore({
            url: config.db,
            collection : 'sessions'
        })*/
    }));

    // use passport session
    app.use(passport.initialize());
    app.use(passport.session());

    // adds CSRF support
    if (process.env.NODE_ENV !== 'test') {
        app.use(csrf());

        // This could be moved to view-helpers :-)
        app.use(function(req, res, next){
            res.locals.csrf_token = req.csrfToken();
            next();
        });
    }

    // set global variables
    app.locals.errors = {};
    app.locals.message = {};
};