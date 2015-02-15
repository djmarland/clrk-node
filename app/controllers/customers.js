"use strict";
/**
 * Customer Controller
 */


//Dependencies
var models = require('models');

exports.listAction = function (req, res, next) {
    var data = {
        customers: null,
        customers_count : null
    };
    models.customer.goFind()
        .then(function(result) {
            data.customers = result.rows;
            data.customers_count = result.count;
            if (req.format == 'json') {
                res.json(data);
            } else {
                res.render('customers/list', data);
            }
        }).catch(next);
};

exports.showAndEditAction = function (req, res, next) {
    var data = {
            customer: req.customer,
            customer_form: req.customer
        },

        render = function() {
            data.customer_form.action = data.customer.url;
            data.customer_form.csrf_token = req.csrfToken();
            data.has_edit_rights = true;
            if (req.format == 'json') {
                res.json(data);
            } else {
                res.render('customers/show', data);
            }
        },
        latest = function() {
            return models.job.findLatestByCustomer(data.customer)
                .then(function(result) {
                    data.latest_jobs = result.rows;
                    data.jobs_count = result.count;
                })
                .catch(function(err) {
                    req.flash('msg',{
                        message : 'Unable to fetch jobs',
                        type : "error",
                        debug : err.message
                    });
                }).finally(function() {
                    render();
                });
        };

    if (req.method === 'POST') {
        data.customer_form = req.body;
        data.customer.update(data.customer_form)
            .then(function(result) {
                res.locals.messages.push({
                    message : 'Saved successfully',
                    type : "success"
                });
            })
            .catch(function (err) {
                if (err.name === 'SequelizeValidationError') {
                    err.errors.forEach(function(e) {
                        res.locals.messages.push({
                            message : e.message,
                            type : "error"
                        });
                    });
                } else {
                    // general error
                    res.locals.messages.push({
                        message : 'Error saving data. Please try again',
                        type : "error",
                        debug : err.message
                    });

                }
            })
            .finally(function() {
                latest();
            });

    } else {
        latest();
    }

};

exports.newAction = function (req, res) {
    res.render('customers/new', {
        customer_form : {
            action : '/customers/new',
            csrf_token : req.csrfToken()
        }
    });
};

exports.createAction = function (req, res, next) {
    var data = {
        customer_form : req.body
    };
    models.customer.new(data.customer_form)
        .then(function(result) {
            // all was good
            req.flash('msg',{
                message : result.name + ' was created as a customer and saved',
                type : "success"
            });
            // redirect to customer page
            res.redirect(result.url);
        })
        .catch(function(err) {
            data.customer_form.action = '/customers/new';
            data.customer_form.csrf_token = req.csrfToken();
            if (err.name === 'SequelizeValidationError') {
                data.customer_form.validation_errors = {};
                // validation error. set value and continue
                err.errors.forEach(function(e) {
                    data.customer_form.validation_errors[e.path] = e.message;
                    data.customer_form.validation_errors[e.path + '_class'] = 'error';
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
            res.render('customers/new', data);
        });
};

exports.searchPostAction = function(req, res, next) {
    var data = req.body,
        query = data.q || '';
    return res.redirect('?q=' + query);
}

exports.searchAction = function(req, res, next) {
    var query = req.query || null,
        data = {
            query : query.q || null,
            customer_count : null,
            customers : null
        },
        render = function() {
            if (req.format == 'json') {
                res.json(data);
            } else {
                res.render('customers/search', data);
            }
        };



    if (data.query) {
        data.search_form = {
            q : data.query
        };

        models.customer.searchAndCount(
            data.query,
            10,
            res.locals.page
        )
            .then(function(result) {
                data.customers = result.rows;
                data.customers[0].inlineAddress;
                data.customers_count = result.count;
                render();
            });
    } else {
        render();
    }
};

