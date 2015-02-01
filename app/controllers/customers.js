"use strict";
/**
 * Customer Controller
 */


//Dependencies
var models = require('models');


exports.listAction = function (request, response, next) {
    var data = {
        customers: null,
        customers_count : null
    };
    models.customer.goFind()
        .then(function(result) {
            data.customers = result.rows;
            data.customers_count = result.count;
            if (request.format == 'json') {
                response.json(data);
            } else {
                response.render('customers/list', data);
            }
        }).catch(next);
};

exports.showAction = function (request, response, next) {
    var data = {
        customer: request.customer
    };
    models.job.findLatestByCustomer(data.customer)
    .then(function(result) {
        data.latest_jobs = result.rows;
        data.jobs_count = result.count;
        if (request.format == 'json') {
            response.json(data);
        } else {
            response.render('customers/show', data);
        }
    })
    .catch(next);
};

exports.newAction = function (request, response) {
    response.render('customers/new');
};

exports.createAction = function (request, response, next) {
    var data = {
        body : request.body
    }
    models.customer.new(data.body)
        .then(function(result) {
            // all was good
            // redirect to customer page
            response.redirect(result.getUrl());
        })
        .catch(function(err) {
            if (err.name === 'SequelizeValidationError') {
                // validation error. set value and continue
                data.validation_errors = err.errors;
                response.render('customers/new', data);
            } else {
                // general error, forward to error handler
                next(err);
            }
        });
};