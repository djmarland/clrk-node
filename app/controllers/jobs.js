"use strict";
/**
 * Customer Controller
 */


//Dependencies
var models  = require('models'),
    utils   = require('utils');

exports.listAction = function (req, res, next) {
    var perPage = 200,
        data = {
            jobs: null,
            pagination : utils.pagination.setup(
                perPage,
                req
            )
        };
    models.job.findLatest(
        data.pagination.perPage,
        data.pagination.currentPage
    ).then(function(result) {
            var err;
            data.jobs = result.rows;
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
                res.render('jobs/list', data);
            }
        }).catch(next);
};


exports.showAndEditAction = function (req, res, next) {
    var data = {
            job: req.job,
            jobForm: req.job
        },

        render = function() {
            data.jobForm.action = data.job.url;
            data.jobForm.csrfToken = req.csrfToken();
            data.hasEditRights = true;
            if (req.format == 'json') {
                res.json(data);
            } else {
                res.render('jobs/show', data);
            }
        };

    if (req.method === 'POST') {
        data.jobForm = req.body;
        data.jobForm.editedById = req.user.id;
        data.job.update(data.jobForm)
            .then(function(result) {
                data.job.Editor = req.user;
                res.locals.messages.push({
                    message : 'Saved successfully',
                    type : "success"
                });
            })
            .catch(function (err) {
                utils.crud.setFormValidationErrors(data.jobForm, res, err);
            })
            .finally(function() {
                render();
            });

    } else {
        render();
    }

};


exports.newAction = function (req, res) {
    res.render('jobs/new', {
        jobForm : {
            action : '/jobs/new',
            csrfToken : req.csrfToken()
        }
    });
};

exports.createAction = function (req, res, next) {
    var data = {
        jobForm : req.body
    };
    data.jobForm.editedById = req.user.id;
    // if a customer key was not set
    // create a customer, and get its ID

    models.job.new(data.jobForm)
        .then(function(result) {
            // all was good
            req.flash('msg',{
                message : result.title + ' was created as a job and saved',
                type : "success"
            });
            // redirect to job page
            res.redirect(result.url);
        })
        .catch(function(err) {
            data.jobForm.action = '/jobs/new';
            data.jobForm.csrfToken = req.csrfToken();
            utils.crud.setFormValidationErrors(data.jobForm, res, err);
            res.render('jobs/new', data);
        });
};