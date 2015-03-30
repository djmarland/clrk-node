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
        },
        render = function() {
            data.jobForm.action = '/jobs/new';
            data.jobForm.csrfToken = req.csrfToken();
            console.log(data.jobForm.validationErrors);
            return res.render('jobs/new', data);
        },
        checkCustomer = function(key) {
            models.customer.findByKey(key)
                .then(function(result) {
                    // all was good
                    data.jobForm.customerId = result.id;
                    createJob(data.jobForm);
                })
                .catch(function(err) {
                    // customer didn't exist
                    data.jobForm.validationErrors = {};
                    data.jobForm.validationErrors.customerKey = 'No such customer';
                    data.jobForm.validationErrors.customerKeyClass = 'error';
                    res.locals.messages.push({
                        message : 'No such customer',
                        type : 'error'
                    });
                    render();
                });
        },
        createCustomer = function(fields) {
            var customer = {
                name : fields.customerName,
                editedById : req.user.id,
                address : fields.customerAddress,
                postcode : fields.customerPostcode
            };
            return models.customer.new(customer)
                .then(function(result) {
                    // all was good
                    data.jobForm.customerId = result.id;
                    createJob(data.jobForm);
                })
                .catch(function(err) {
                    utils.crud.setFormValidationErrors(data.jobForm, res, err, {
                        name : 'customerName',
                        address : 'customerAddress',
                        postcode : 'customerPostcode'
                    });
                    render();
                });
        },
        createJob = function(fields) {
            return models.job.new(fields)
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
                    utils.crud.setFormValidationErrors(data.jobForm, res, err);
                    render();
                });
        };

    data.jobForm.editedById = req.user.id;

    // if a customer key was not set
    // create a customer, and get its ID
    if (data.jobForm.customerKey) {
        // check customer exists
        checkCustomer(data.jobForm.customerKey);
    } else {
        // create a customer
        createCustomer(data.jobForm);
    }

};