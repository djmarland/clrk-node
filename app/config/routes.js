"use strict";

/**
 * routes file, for whole application
 */


// setup the controller dependencies
var home        = require('controllers/home'),
    customers   = require('controllers/customers'),
    users       = require('controllers/users'),
    jobs        = require('controllers/jobs'),


    models      = require('models');

module.exports = function (app) {

    /**
     * Pre-fetch the application settings
     */
    app.use(function (req, res, next) {
        models.settings.get()
            .then(function(result) {
                // apply the settings to the request
                req.appSettings = result;

                // ensure the views can see the settings
                res.locals.appSettings = result;

                // set the default theme CSS
                res.locals.themeCss = 'css/' + res.locals.appSettings.theme + '.css';

                // continue
                return next();
            })
            .catch(function(err) {
                // serious error. App must die
                err.status = 500;
                return next(err);
            });

    });


    /**
     * Pages that don't need login go first
     */
    app.all('/login', users.loginAction);

    app.get('/logout', function(req, res){
        if (req.user) {
            req.logout();
            req.flash('msg', {
                message: 'Logged out sucessfully',
                type: "success"
            });
        } else {
            req.flash('msg', {
                message: "You're not logged in. You must therefore login before you can log out. But logging in when you're already logged out in order to log out once logged in would be logging in pointlessly, as you're already logged out.",
                type: "info"
            });
        }

        // manual redirect to ensure cookie was really set
        res.location('/');
        res.writeHead(302);
        return res.end();
    });

    app.get('/users/:userKey/reset-password', users.resetPasswordAction);

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
            // a user was fetched. Override theme with the user preference
            if (req.user.theme) {
                res.locals.themeCss = 'css/' + req.user.theme + '.css';
            }

            // ensure the permissions were fetched (later - should be via Permissions model)
            return models.group.findPermissionByUser(req.user)
                .then(function(result) {
                    // apply the settings to the request
                    req.user.permissions = result;

                    // ensure the views can see the user
                    res.locals.loggedInUser = req.user;

                    // continue
                    return next();
                })
                .catch(function(err) {
                    // serious error. App must die
                    err.status = 500;
                    return next(err);
                });
        }
    });

    // Change Password page does not need the password to be in date
    app.all('/change-password', users.changePasswordAction);

    // All other routes need to check that your password has not expired
    app.use(function (req, res, next) {
        var data = {},
            sendTo;
        if(req.user.passwordExpired){
            sendTo = req.path || '/';
            if (sendTo == '/change-password') {
                sendTo = '/';
            }
            data.passwordForm = {
                csrfToken : req.csrfToken(),
                sendTo : sendTo
            };
            res.render('users/change-password', data);
        } else {
            next();
        }
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
     * Standalone routes
     */
    app.get('/', home.indexAction);
    app.all('/settings.:format?', home.settingsAction);
    app.get('/styleguide', home.styleguideAction);


    /**
     * User routes
     */

    app.get('/users.:format?', users.listAction);
    app.get('/users/new', users.newAction);
    app.post('/users/new', users.createAction);
    app.all('/users/:userKey.:format?', users.showAndEditAction);


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

                req.viewedUser = user;
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
     * Jobs routes (in order of preference
     */
    app.get('/jobs.:format?', jobs.listAction);
 //   app.get('/jobs/new', jobs.newAction);
 ///   app.post('/jobs/new', jobs.createAction);
 //   app.get('/jobs/search.:format?', jobs.searchAction);
 //   app.post('/jobs/search', jobs.searchPostAction);
    app.all('/jobs/:jobKey.:format?', jobs.showAndEditAction);
 //   app.get('/jobs/:jobKey/versions.:format?', jobs.versionsListAction);
 //   app.get('/jobs/:jobKey/versions/:versionKey.:format?', jobs.versionsShowAction);


    app.param('jobKey', function(req, res, next, jobKey) {
        var upperKey = jobKey.toUpperCase();
        if (upperKey != jobKey) {
            // @todo move this redirect into nginx (for all keys)
            return res.redirect('/jobs/' + upperKey);
        }

        return models.job.findByKey(jobKey)
            .then(function(job) {
                if (!job) {
                    var err = new Error;
                    err.message = 'No such job';
                    err.status = 404;
                    return next(err);
                }

                // if the job version is a subversion, redirect
                if (job.versionOfId) {
                    return res.redirect(job.url);
                }

                req.job = job;
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