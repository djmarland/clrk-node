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

exports.styleguideAction = function (req, res) {
    res.render('home/styleguide');
};

exports.settingsAction = function (req, res, next) {
    var data = {
            form : req.appSettings
        },
        render = function() {
            if (req.format == 'json') {
                res.json(data.form);
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
        data.form = req.body;
        req.appSettings.update(data.form)
            .then(function(result) {
                res.locals.messages.push({
                    message : 'Saved successfully',
                    type : "success"
                });
                // override previously set data with the result
                res.locals.appSettings = result;

                // set the theme if it changed
                if (!req.user.theme) {
                    res.locals.themeCss = 'css/' + result.theme + '.css'
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