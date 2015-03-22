"use strict";
/**
 * Home Controller
 */


//Dependencies
var models = require('models'),
    utils  = require('utils');


exports.indexAction = function (req, res) {
    var results = {
            jobs : null,
            jobs_count : null
        };



    models.job.goFind().then(function(result) {
        results.jobs = result.rows;
        results.jobs_count = result.count;

            res.render('home/index', results);
    })
    .catch(function(e) {
        res.send('killed');
    }).finally(function() {

    });
};

exports.settingsAction = function (req, res, next) {
    var data = {
            settingsForm : req.appSettings
        },
        render = function() {
            if (req.format == 'json') {
                res.json(data.settingsForm);
            } else {
                res.render('home/settings', data);
            }
        },
        err;

    if (!req.user.permissions.canEditSettings) {
        err = new Error;
        err.message = 'You do not have permission to do this';
        err.status = 403;
        return next(err);
    }

    if (req.method === 'POST') {
        data.settingsForm = req.body;
        req.appSettings.update(data.settingsForm)
            .then(function(result) {
                res.locals.messages.push({
                    message : 'Saved successfully',
                    type : "success"
                });
                // override previously set data with the result
                res.locals.appSettings = result;
            })
            .catch(function (err) {
                utils.crud.setFormValidationErrors(data.settingsForm, res, err);
            })
            .finally(function() {
                render();
            });
    } else {
        render();
    }


};