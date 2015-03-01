"use strict";

var local = require('./passport/local'),
    models = require('models');

module.exports = function (passport) {
    // serialize sessions
    passport.serializeUser(function(user, done) {
        done(null, user.id)
    });

    passport.deserializeUser(function(id, done) {
        // query the current user from database
        return models.user.findById(id)
            .then(function(result) {
                done(null, result);
            }).catch(function(err) {
                done(err, null);
            });
    });

    // use these strategies
    passport.use('local', local);
};