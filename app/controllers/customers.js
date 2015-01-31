"use strict";
/**
 * Customer Controller
 */


//Dependencies
var models = require('models');


exports.listAction = function (request, response) {
    var results = {
        customers: null,
        customers_count : null
    };
    models.customer.goFind()
        .then(function(result) {
            results.customers = result.rows;
            results.customers_count = result.count;
        })
        .catch(function(e) {
            console.log(e.message);
        }).finally(function() {
            response.render('customers/list', results);
        });
};

exports.showAction = function (request, response) {
    var data = {
        customer: request.customer
    };
    models.job.findLatestByCustomer(data.customer)
    .then(function(result) {
        data.jobs = result.rows;
        data.jobs_count = result.count;
    })
    .catch(function(e) {
        console.log(e.message);
    }).finally(function() {
        response.render('customers/show', data);
    });
};

exports.newAction = function (request, response) {
    response.render('customers/new');
};