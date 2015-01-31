"use strict";

/**
 * routes file, for whole application
 */


// setup the controller dependencies
var home        = require('controllers/home');
var customers   = require('controllers/customers');

module.exports = function (app, passport) {


    /**
     * Home route
     */
    app.get('/', home.indexAction);

    /**
     * Customers routes
     */
    app.get('/customers', customers.listAction);
    app.get('/customers', customers.listAction);

    /**
     * Error handling
     */
    app.use(function (err, req, res, next) {
        // treat as 404
        if (err.message
            && (~err.message.indexOf('not found')
            || (~err.message.indexOf('Cast to ObjectId failed')))) {
            return next();
        }
        console.error(err.stack);
        // error page
        res.status(500).render('500', { error: err.stack });
    });

    // assume 404 since no middleware responded
    app.use(function (req, res, next) {
        res.status(404).render('404', {
            url: req.originalUrl,
            error: 'Not found'
        });
    });
};