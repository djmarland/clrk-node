"use strict";

/**
 * Module dependencies.
 */
    // main express
var express         = require('express'),
    // handlebars
    handlebars      = require('express-handlebars'),
    // handlebars for express
    exphbs          = require('express-handlebars'),
    // session handling
    session         = require('express-session'),
    // gzip static assets
    compression     = require('compression'),
    // flash messages
    flash           = require('connect-flash'),
    // parse cookies
    cookieParser    = require('cookie-parser'),
    // for parsing JSON
    bodyParser      = require('body-parser'),
    // for recieving POST
    methodOverride  = require('method-override'),
    // CSRF form tokens
    csrf            = require('csurf'),
    // connection sessions to sequelize
    SequelizeStore = require('connect-session-sequelize')(session.Store),

    models = require('models'),
    config = require('config/config'),
    pkg = require('../package.json'),

    env = process.env.NODE_ENV || 'production',

    hbs, sess;

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

    sess =  {
        name: 'app-state',
        resave: false,
        secret: pkg.name,
        cookie: {
            maxAge: (1000*60*60*24*365),
            httpOnly: false
        },
        saveUninitialized: false,
        store: new SequelizeStore({
            db: models.sequelize
        })
    };

    if (app.get('env') === 'production') {
        app.set('trust proxy', 1); // trust first proxy
        sess.cookie.secure = true; // serve secure cookies
    }

    app.use(session(sess));

    // setup flash messenger
    app.use(flash());
    app.use(function(req, res, next){
        res.locals.messages = req.flash('msg');
        next();
    });

    // use passport session
    app.use(passport.initialize());
    app.use(passport.session());

    // adds CSRF support{
    app.use(csrf());

    // This could be moved to view-helpers :-)
    app.use(function(req, res, next){
        res.locals.csrfToken = req.csrfToken();
        next();
    });
};