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
    app.get('/customers/:customer_id', customers.showAction);

    //app.post('/customers/new', customers.createAction);

    app.param('customer_id', function(request, response, next, user_id) {
        user_id = parseInt(user_id);
        return models.customer.findById(user_id)
            .then(function(result) {
                if (!result) {
                    var err = new Error;
                    err.message = 'No such customer';
                    err.status = 404;
                    return next(err);
                }
                request.customer = result;
                return next();
            })
            .catch(function(err) {
                return next(err);
            });
    });

    /**
     * Error handling
     */
    app.use(function (err, request, response, next) {
        // treat as 404
        if (err.message
            && (~err.message.indexOf('not found')
            || (~err.message.indexOf('Cast to ObjectId failed')))) {
            return next();
        }
        // error page
        if (err.status === 404) {
            response.status(404).render('404', { error: err.stack });
        } else {
            response.status(500).render('500', { error: err.stack });
            console.error(err.stack);
        }
    });

    // assume 404 since no middleware responded
    app.use(function (request, response, next) {
        response.status(404).render('404', {
            url: request.originalUrl,
            error: 'Not found'
        });
    });
};