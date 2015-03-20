"use strict";
/**
 * Home Controller
 */


//Dependencies
var models   = require('models'),
    utils    = require('utils'),
    passport = require('passport');

exports.listAction = function (req, res, next) {
    var perPage = 200,
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

exports.showAndEditAction = function (req, res) {
    var data = {
            user: req.viewedUser,
            userForm: req.viewedUser,
            userIsCurrent: req.viewedUser.matches(req.user)
        },

        render = function() {
            data.userForm.action = data.user.url;
            data.userForm.csrfToken = req.csrfToken();
            data.hasEditRights = true; // @todo - check for rights
            if (req.format == 'json') {
                res.json(data);
            } else {
                res.render('users/show', data);
            }
        };

    if (req.method === 'POST') {
        data.userForm = req.body;
        data.user.update(data.userForm)
            .then(function(result) {
                res.locals.messages.push({
                    message : 'Saved successfully',
                    type : "success"
                });
                // override previously set data with the result (where required)
                req.viewedUser = data.user = result
                if (data.userIsCurrent) {
                    res.locals.loggedInUser = req.viewedUser;
                }
            })
            .catch(function (err) {
                utils.crud.setFormValidationErrors(data.userForm, res, err);
            })
            .finally(function() {
                render();
            });
    } else {
        render();
    }

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
    data.userForm.passwordExpiry = utils.time.now;
    data.userForm.password = generatedPassword;
    models.user.new(data.userForm)
        .then(function(result) {
            var emailData = {
                layout : 'email',
                user : {
                    name: result.name,
                    email: result.email,
                    password: generatedPassword
                }
            };
            // send the user a welcome e-mail
            res.render('emails/new-user', emailData, function(err, body){
                utils.mail.send(
                    result.email,
                    'Welcome to your new account',
                    body
                );
            });

            // all was good
            req.flash('msg',{
                message : result.name + ' was created as a user and has been e-mailed an initial login password',
                type : "success"
            });

            // redirect to user page
            res.redirect(result.url);
        })
        .catch(function(err) {
            data.userForm.action = '/users/new';
            data.userForm.csrfToken = req.csrfToken();
            utils.crud.setFormValidationErrors(data.userForm, res, err);
            res.render('users/new', data);
        });
};

exports.loginAction = function (req, res, next) {
    var data = {
            layout : 'login',
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
                    type : 'error',
                    debug : 'Debug: ' + info.message
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
    } else {
        render();
    }
};

exports.changePasswordAction = function (req, res, next) {
    var message,
        data = {
            passwordForm: req.body || {}
        },
        render = function () {
            data.requiresCurrentPassword = !req.user.passwordExpired;
            data.passwordForm.csrfToken = req.csrfToken();
            res.render('users/change-password', data);
        };

    if (req.method === 'POST') {
        // reset passwordExpiry
        data.passwordForm.passwordExpiry = null;
        req.user.update(data.passwordForm)
            .then(function(result) {
                message = {
                    message : 'Password updated successfully',
                    type : "success"
                };

                if (data.passwordForm.sendTo) {
                    req.flash('msg',message);
                    return res.redirect(data.passwordForm.sendTo);
                }

                res.locals.messages.push(message);
                return render();
            })
            .catch(function (err) {
                utils.crud.setFormValidationErrors(data.passwordForm, res, err);
                return render();
            });

        // @todo will this need to reset the user cookie?
    } else {
        return render();
    }
};