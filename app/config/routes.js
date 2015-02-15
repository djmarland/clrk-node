"use strict";

/**
 * routes file, for whole application
 */


// setup the controller dependencies
var home        = require('controllers/home');
var customers   = require('controllers/customers');

var models      = require('models');

module.exports = function (app, passport) {

    /**
     * Setup page number
     */
    app.use(function (req, res, next) {
        var query = req.query,
            page = query.page || null,
            err = new Error;

        err.status = 400;

        if (page === null) {
            page = 1;
        }

        if (isNaN(page)) {
            err.message = 'Page parameter is not a number';
            return next(err);
        }

        page = parseInt(page, 10);

        if (page < 1) {
            err.message = 'Page parameter must be greater than 0';
            return next(err);
        }

        res.locals.page = page;
        return next();
    });

    /**
     * Home route
     */
    app.get('/', home.indexAction);

    /**
     * Customers routes (in order of preference)
     */
    app.get('/customers.:format?', customers.listAction);
    app.get('/customers/new', customers.newAction);
    app.post('/customers/new', customers.createAction);
    app.get('/customers/search.:format?', customers.searchAction);
    app.post('/customers/search', customers.searchPostAction);
    app.all('/customers/:customer_key.:format?', customers.showAndEditAction);


    app.param('customer_key', function(req, res, next, customer_key) {
        var upperKey = customer_key.toUpperCase();
        if (upperKey != customer_key) {
            // @todo use current route and params
            return res.redirect('/customers/' + upperKey);
        }

        return models.customer.findByKey(customer_key)
            .then(function(customer) {
                if (!customer) {
                    var err = new Error;
                    err.message = 'No such customer';
                    err.status = 404;
                    return next(err);
                }
                req.customer = customer;
                return next();
            })
            .catch(next);
    });


    /**
     * Recognise the formats
     */

    app.param('format', function(req, res, next, format) {
        if (format &&
            format != 'json') {
            var err = new Error;
            err.message = 'No such format';
            err.status = 404;
            return next(err);
        }
        req.format = format;
        return next();
    });

    // assume 404 since no middleware responded
    // this is for when no routes match (so no format)
    app.use(function (req, res, next) {
        res.status(404).render('404', {
            url: req.originalUrl,
            message: 'Not found'
        });
    });

    /**
     * Error handling
     */
    app.use(function (err, req, res, next) {
        // error page
        var data = {
            status: err.status || 500,
            message: err.message || 'Error',
            stack: err.stack || null
        };

        var acceptableStatuses = [
            400, 403, 404, 500
        ];

        if (acceptableStatuses.indexOf(data.status) === -1) {
            data.status = 500;
        }

        res.status(data.status);
        if (req.format == 'json') {
            res.json(data);
        } else {
            res.render(data.status.toString(), data);
        }
    });


};