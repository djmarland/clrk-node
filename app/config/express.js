"use strict";

// Dependencies
var express = require('express'),
    session = require('express-session'),
    handlebars  = require('express-handlebars'),
    exphbs  = require('express-handlebars'),
    compression = require('compression'),
    flash = require('connect-flash'),
    cookieParser = require('cookie-parser'),
    cookieSession = require('cookie-session'),
    bodyParser = require('body-parser'),
    methodOverride = require('method-override'),
    csrf = require('csurf'),

    config = require('config/config'),
    pkg = require('../package.json'),

    env = process.env.NODE_ENV || 'development', // @todo - ensure production is default

    hbs;

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

    hbs = exphbs({
        defaultLayout: 'main',
        helpers: require('helpers')
    });

    app.engine('handlebars', hbs);

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

    // setup flash messenger
    app.use(flash());
    app.use(function(req, res, next){
        res.locals.messages = req.flash('msg');
        next();
    });

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
};