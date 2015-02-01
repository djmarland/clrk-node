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
    app.get('/customers', customers.listAction);
    app.get('/customers/new', customers.newAction);
    app.get('/customers/:customer_key', customers.showAction);

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

    // assume 404 since no middleware responded
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
        if (err.status === 404) {
            response.status(404).render('404', {
                message: err.message
            });
        } else if (err.status === 403) {
            response.status(403).render('403', {
                message: err.message
            });
        } else {
            response.status(500).render('500', {
                stack: err.stack,
                message : err.message
            });
            console.error(err.stack);
        }
    });


};