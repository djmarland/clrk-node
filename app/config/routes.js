"use strict";

/**
 * routes file, for whole application
 */


// setup the controller dependencies
var home        = require('controllers/home'),
    customers   = require('controllers/customers'),
    users       = require('controllers/users'),


    models      = require('models');

module.exports = function (app) {

    /**
     * Pages that don't need login go first
     */
    app.all('/login', users.loginAction); // @todo - handler to check if already logged in

    /**
     * Should always be logged in for everything else
     */
    app.use(function (req, res, next) {
        var data = {
                layout : 'login'
            },
            sendTo;
        if(!req.isAuthenticated()){
            sendTo = req.path || '/';
            if (sendTo == '/login') {
                sendTo = '/';
            }
            data.loginForm = {
                csrfToken : req.csrfToken(),
                sendTo : sendTo
            };
            res.render('users/login', data);
        } else {
        // if password expired, redirect to change password screen
            res.locals.loggedInUser = req.user;
            next();
        }
    });

    app.get('/logout', function(req, res){
        req.logout();
        req.flash('msg',{
            message : 'Logged out sucessfully',
            type : "success"
        });
        res.redirect('/');
    });

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
     * User routes
     */
    app.get('/users.:format?', users.listAction);
    app.get('/users/new', users.newAction);
    app.post('/users/new', users.createAction);
    app.get('/users/:userKey.:format?', users.showAction);


    app.param('userKey', function(req, res, next, userKey) {
        var upperKey = userKey.toUpperCase();
        if (upperKey != userKey) {
            // @todo move this redirect into nginx (for all keys)
            return res.redirect('/users/' + upperKey);
        }

        return models.user.findByKey(userKey)
            .then(function(user) {
                if (!user) {
                    var err = new Error;
                    err.message = 'No such user';
                    err.status = 404;
                    return next(err);
                }

                // if the user version is a subversion, redirect
                if (user.versionOfId) {
                    return res.redirect(user.url);
                }

                req.user = user;
                return next();
            })
            .catch(next);
    });

    /**
     * Customers routes (in order of preference)
     */
    app.get('/customers.:format?', customers.listAction);
    app.get('/customers/new', customers.newAction);
    app.post('/customers/new', customers.createAction);
    app.get('/customers/search.:format?', customers.searchAction);
    app.post('/customers/search', customers.searchPostAction);
    app.all('/customers/:customerKey.:format?', customers.showAndEditAction);
    app.get('/customers/:customerKey/versions.:format?', customers.versionsListAction);
    app.get('/customers/:customerKey/versions/:versionKey.:format?', customers.versionsShowAction);


    app.param('customerKey', function(req, res, next, customerKey) {
        var upperKey = customerKey.toUpperCase();
        if (upperKey != customerKey) {
            // @todo move this redirect into nginx (for all keys)
            return res.redirect('/customers/' + upperKey);
        }

        return models.customer.findByKey(customerKey)
            .then(function(customer) {
                if (!customer) {
                    var err = new Error;
                    err.message = 'No such customer';
                    err.status = 404;
                    return next(err);
                }

                // if the customer version is a subversion, redirect
                if (customer.versionOfId) {
                    return res.redirect(customer.url);
                }

                req.customer = customer;
                return next();
            })
            .catch(next);
    });

    app.param('versionKey', function(req, res, next, versionKey) {
        return models.customer.findByKey(versionKey)
            .then(function(version) {
                if (!version) {
                    var err = new Error;
                    err.message = 'No such version';
                    err.status = 404;
                    return next(err);
                }

                req.version = version;
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