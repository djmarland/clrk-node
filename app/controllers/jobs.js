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
    var data = {
            form : {
                action : '/jobs/new'
            }
        },
        render = function() {
            models.type.getList().then(function(result) {
                data.types = result;
                data.form.csrfToken = req.csrfToken()
                res.render('jobs/new', data);
            })
            .catch(function(e) {
                // @todo - log this
                res.send('killed');
            });
        },
        checkCustomer = function(key) {
            models.customer.findByKey(key)
                .then(function(result) {
                    // all was good
                    data.form.customerId = result.id;
                    createJob(data.form);
                })
                .catch(function(err) {
                    // customer didn't exist
                    data.form.validationErrors = {};
                    data.form.validationErrors.customerKey = 'No such customer';
                    data.form.validationErrors.customerKeyClass = 'error';
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
                postcode : fields.customerPostcode,
                phoneNumber : fields.customerPhoneNumber
            };
            return models.customer.new(customer)
                .then(function(result) {
                    // all was good
                    data.form.customerId = result.id;
                    createJob(data.form);
                })
                .catch(function(err) {
                    utils.crud.setFormValidationErrors(data.form, res, err, {
                        name : 'customerName',
                        address : 'customerAddress',
                        postcode : 'customerPostcode',
                        phoneNumber : 'customerPhoneNumber'
                    });
                    render();
                });
        },
        createJob = function(fields) {
            console.log(fields.typeId);
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
                    utils.crud.setFormValidationErrors(data.form, res, err);
                    render();
                });
        };

    if (req.method === 'POST') {
        data.form = req.body;
        data.form.editedById = req.user.id;

        // check the typeID, and create a new one if needed
        if (data.form.typeId == 'new') {
            if (data.form.newType) {

                // create the type
                // set the typeID to that type
                // start customer check

            } else {
                data.form.validationErrors = {};
                data.form.validationErrors.newType = 'A type name was not set';
                data.form.validationErrors.newTypeClass = 'error';
                res.locals.messages.push({
                    message : 'A type name was not set',
                    type : 'error'
                });
                return render(); //bail
            }
        }


        // if a customer key was not set
        // create a customer, and get its ID
        if (data.form.customerKey) {
            // check customer exists
            checkCustomer(data.form.customerKey);
        } else {
            // create a customer
            createCustomer(data.form);
        }
    } else {
        render();
    }

};