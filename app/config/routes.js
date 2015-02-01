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
     * Home route
     */
    app.get('/', home.indexAction);

    /**
     * Customers routes
     */
    app.get('/customers.:format?', customers.listAction);
    app.get('/customers/new', customers.newAction);
    app.get('/customers/:customer_key.:format?', customers.showAction);

    app.post('/customers/new', customers.createAction);

    app.param('customer_key', function(request, response, next, user_id) {
        return models.customer.findById(user_id)
            .then(function(customer) {
                if (!customer) {
                    var err = new Error;
                    err.message = 'No such customer';
                    err.status = 404;
                    return next(err);
                }
                request.customer = customer;
                return next();
            })
            .catch(next);
    });

    app.param('format', function(request, response, next, format) {
        if (format &&
            format != 'json') {
            var err = new Error;
            err.message = 'No such format';
            err.status = 404;
            return next(err);
        }
        request.format = format;
        return next();
    });

    // assume 404 since no middleware responded
    // this is for when no routes match (so no format)
    app.use(function (request, response, next) {
        response.status(404).render('404', {
            url: request.originalUrl,
            message: 'Not found'
        });
    });

    /**
     * Error handling
     */
    app.use(function (err, request, response, next) {
        // error page
        var data = {
            status: err.status || 500,
            message: err.message || 'Error',
            stack: err.stack || null
        };

        var acceptableStatuses = [
            403, 404, 500
        ]

        if (acceptableStatuses.indexOf(data.status) === -1) {
            data.status = 500;
        }

        response.status(data.status);
        if (request.format == 'json') {
            response.json(data);
        } else {
            response.render(data.status.toString(), data);
        }
    });


};