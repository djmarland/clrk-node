"use strict";
/**
 * Home Controller
 */


//Dependencies
var models = require('models');


exports.indexAction = function (req, res) {
    var results = {
            customers: null,
            customers_count : null,
            jobs : null,
            jobs_count : null
        };
    models.customer.goFind()
    .then(function(result) {
        results.customers = result.rows;
        results.customers_count = result.count;

        // get jobs
        return models.job.goFind();

    }).then(function(result) {
        results.jobs = result.rows;
        results.jobs_count = result.count;

        res.render('home/index', results);
    })
    .catch(function(e) {
        console.log(e.message);
            res.send('killed');
    }).finally(function() {

    });
};