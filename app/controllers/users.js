"use strict";
/**
 * Home Controller
 */


//Dependencies
var models   = require('models'),
    utils    = require('utils'),
    passport = require('passport');

exports.listAction = function (req, res, next) {
    var perPage = 50,
        data = {
            users: null,
            pagination : utils.pagination.setup(
                perPage,
                req
            )
        };
    models.user.getAll(
        data.pagination.perPage,
        data.pagination.currentPage
    ).then(function(result) {
            var err;
            data.users = result.rows;
            data.pagination.finalise(result.count);

            if (data.pagination.isOutOfRange()) {
                err = new Error;
                err.message = 'No such page number';
                err.status = 404;
                return next(err);
            }

            if (req.format == 'json') {
                res.json(data);
            } else {
                res.render('users/list', data);
            }
        }).catch(next);
};

exports.showAction = function (req, res) {
    var data = {
            user: req.user
        },

        render = function() {
            if (req.format == 'json') {
                res.json(data);
            } else {
                res.render('users/show', data);
            }
        };

    render();
};

exports.newAction = function (req, res) {
    res.render('users/new', {
        userForm : {
            action : '/users/new',
            csrfToken : req.csrfToken()
        }
    });
};

exports.createAction = function (req, res, next) {
    var data = {
            userForm : req.body
        },
        // generate a password by reversing the current timestamp
        generatedPassword = Date.now().toString().split("").reverse().join("");

    // ensure the password has expired
    data.userForm.passwordExpired = new Date();
    data.userForm.password = generatedPassword;
    models.user.new(data.userForm)
        .then(function(result) {
            // all was good
            req.flash('msg',{
                message : result.name + ' was created as a user and saved. Their temporary password is: ' + generatedPassword,
                type : "success"
            });
            // redirect to user page
            res.redirect(result.url);
        })
        .catch(function(err) {
            data.userForm.action = '/users/new';
            data.userForm.csrfToken = req.csrfToken();
            if (err.name === 'SequelizeValidationError') {
                data.userForm.validationErrors = {};
                // validation error. set value and continue
                err.errors.forEach(function(e) {
                    data.userForm.validationErrors[e.path] = e.message;
                    data.userForm.validationErrors[e.path + 'Class'] = 'error';
                    res.locals.messages.push({
                        message : e.message,
                        type : "error"
                    });
                });

            } else {
                // general error, send to view
                res.locals.messages.push({
                    message : 'Failed to save. Please try again',
                    type : "error",
                    debug : err.message
                });
            }
            res.render('users/new', data);
        });
};

exports.loginAction = function (req, res, next) {
    var data = {
            loginForm : {}
        },
        render = function() {
            data.loginForm.csrfToken = req.csrfToken();
            res.render('users/login', data);
        },
        sendTo = req.path || '/';

    if (sendTo == '/login') {
        sendTo = '/';
    }
    data.loginForm.sendTo = sendTo;
    if (req.method === 'POST') {
        data.loginForm = req.body;

        // todo - form validation

        //req.session.cookie.maxAge = (365*24*60*60*1000); // 1 year
        return passport.authenticate('local', function(err, user, info) {
            if (err) { return next(err) }
            if (!user) {
                res.locals.messages.push({
                    message : info.message,
                    type : "error",
                    debug : info.message
                });
                return render();
            }
            req.logIn(user, function(err) {
                if (err) {
                    return next(err);
                }
                req.flash('msg',{
                    message : 'Logged in',
                    type : "success"
                });
                return res.redirect(sendTo);
            });
        })(req, res, next);


        /*models.user.new(data.loginForm)
            .then(function(result) {

            }).catch(function(err) {
                if (err.name === 'SequelizeValidationError') {
                    data.userForm.validationErrors = {};
                    // validation error. set value and continue
                    err.errors.forEach(function(e) {
                        data.userForm.validationErrors[e.path] = e.message;
                        data.userForm.validationErrors[e.path + 'Class'] = 'error';
                        res.locals.messages.push({
                            message : e.message,
                            type : "error"
                        });
                    });

                } else {
                    // general error, send to view
                    res.locals.messages.push({
                        message : 'Failed to save. Please try again',
                        type : "error",
                        debug : err.message
                    });
                }
                render();
            });*/
    } else {
        render();
    }
};