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