"use strict";
/**
 * Customer Controller
 */


//Dependencies
var models = require('models');


exports.listAction = function (request, response, next) {
    var results = {
        customers: null,
        customers_count : null
    };
    models.customer.goFind()
        .then(function(result) {
            results.customers = result.rows;
            results.customers_count = result.count;
            response.render('customers/list', results);
        }).catch(next);
};

exports.showAction = function (request, response, next) {
    var data = {
        customer: request.customer
    };
    console.log(request.customer.url);
    models.job.findLatestByCustomer(data.customer)
    .then(function(result) {
        data.jobs = result.rows;
        data.jobs_count = result.count;
        response.render('customers/show', data);
    })
    .catch(next);
};

exports.newAction = function (request, response, next) {
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
                data.errors = err.errors;
                response.render('customers/new', data);
            } else {
                // general error, forward to error handler
                next(err);
            }
        });
};