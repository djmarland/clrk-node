"use strict";

/**
 * Module dependencies.
 */
    // setup the strategy
var LocalStrategy   = require('passport-local').Strategy,
    // require access to the models
    models          = require('models');

/**
 * Expose
 */

module.exports = new LocalStrategy({
        usernameField: 'email',
        passwordField: 'password'
    },
    function(email, password, done) {
        models.user.findByEmail(email)
            .then(function(result) {
                if (!result) {
                    return done(null, false, { message: 'Unknown user' });
                }
                if (!result.verifyPassword(password)) {
                    return done(null, false, { message: 'Invalid password' });
                }
                // all good
                return done(null, result);
            }).catch(function(err) {
                return done(err)
            });
    }
);
