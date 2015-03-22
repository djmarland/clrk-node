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

exports.showAndEditAction = function (req, res, next) {
    var data = {
            user: req.viewedUser,
            form: req.viewedUser,
            userIsCurrent: req.viewedUser.matches(req.user)
        },
        err,

        render = function() {
            data.form.action = data.user.url;
            data.form.csrfToken = req.csrfToken();
            data.form.canEditAdminStatus = data.canEditAdminStatus;
            if (req.format == 'json') {
                res.json(data);
            } else {
                res.render('users/show', data);
            }
        };

    data.hasEditRights = (data.userIsCurrent || req.user.permissions.canEditUsers);
    data.canEditAdminStatus = (!data.userIsCurrent && req.user.permissions.canSetAdmins);

    if (req.method === 'POST') {
        data.form = req.body;

        if (!data.hasEditRights) {
            err = new Error;
            err.message = 'You do not have permission to do edit this user';
            err.status = 403;
            return next(err);
        }
        if (data.form.isAdmin && !data.canEditAdminStatus) {
            err = new Error;
            err.message = 'You do not have permission to do set admin status on this user';
            err.status = 403;
            return next(err);
        }

        if (data.canEditAdminStatus) {
            // checkbox was present, so we must make sure its value appears in the data
            if (data.form.isAdmin) {
                // was set in the form
                data.form.isAdmin = true;
            } else {
                // set to false (in case it didn't exist)
                data.form.isAdmin = false;
            }
        }

        data.user.update(data.form)
            .then(function(result) {
                var permissionsCache = res.locals.loggedInUser.permissions;
                res.locals.messages.push({
                    message : 'Saved successfully',
                    type : "success"
                });
                // override previously set data with the result (where required)
                req.viewedUser = data.user = result;
                if (data.userIsCurrent) {
                    res.locals.loggedInUser = req.viewedUser;
                    // restore previous permissions (you can't change them from this screen anyway)
                    res.locals.loggedInUser.permissions = permissionsCache;

                    // set the theme if it changed
                    if (result.theme) {
                        res.locals.themeCss = 'css/' + result.theme + '.css'
                    } else {
                        res.locals.themeCss = 'css/' + res.locals.appSettings.theme + '.css'
                    }
                }
            })
            .catch(function (err) {
                utils.crud.setFormValidationErrors(data.form, res, err);
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
        // generate a password randomly
        generatedPassword = require('MD5')(Math.random());

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
                    body,
                    req
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

    if (req.user) {
        // already logged in
        return res.redirect('/');
    }

    if (sendTo == '/login') {
        sendTo = '/';
    }
    data.loginForm.sendTo = sendTo;
    if (req.method === 'POST') {
        data.loginForm = req.body;

        if (req.body.forgotten !== undefined) {
            // forgotten password button was clicked
            if (data.loginForm.email) {
                // get the user
                return models.user.findByEmail(data.loginForm.email)
                    .then(function(result) {
                        var resetPassword = require('MD5')(Math.random());

                        if (!result) {
                            return; // no such user. Do nothing (don't even tell the user)
                        }

                        // set the reset password
                        result.resetPassword = resetPassword;

                        // save (async)
                        result.save();

                        // send the user a welcome e-mail
                        res.render('emails/reset-password', {
                            layout : 'email',
                            user : result,
                            resetUrl : 'http://localhost:4567' +
                                        result.url +
                                        '/reset-password?single-use-key=' +
                                        resetPassword
                        }, function(err, body){
                            utils.mail.send(
                                result.email,
                                'Reset your password',
                                body,
                                req
                            );
                        });


                    })
                    .catch(function(err) {
                        // todo - log an error happened, but don't send message back to the user
                    })
                    .finally(function() {
                        res.locals.messages.push({
                            message : 'Check your e-mail for instructions on how to reset your password',
                            type : 'info'
                        });
                        return render();
                    });
            } else {
                data.loginForm.validationErrors = {};
                data.loginForm.validationErrors.email = 'E-mail address required';
                data.loginForm.validationErrors.emailClass = 'error';
                res.locals.messages.push({
                    message : 'Enter your e-mail address and click "Forgotten password" to send reset instructions',
                    type : 'error'
                });
                return render();
            }


        }

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
                // manual redirect to ensure cookie was really set
                res.location(data.loginForm.sendTo);
                res.writeHead(302);
                return res.end();
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

exports.resetPasswordAction = function (req, res, next) {
    var key = req.query['single-use-key'],
        err;
    if (key) {
        if (req.viewedUser.verifyResetPassword(key)) {

            // set the password expiry
            req.viewedUser.passwordExpiry = utils.time.now;

            // wipe the single use key
            req.viewedUser.resetHash = null;

            // save
            req.viewedUser.save();

            // log the user in
            return req.logIn(req.viewedUser, function(err) {
                if (err) {
                    return next(err);
                }

                // manual redirect to ensure cookie was really set
                res.location('/');
                res.writeHead(302);
                return res.end();
            });
        }
    }

    // drop through, must have been an issue
    err = new Error;
    err.message = 'Invalid Credentials';
    err.status = 403;
    return next(err);

};