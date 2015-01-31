"use strict";
/**
 * Customer Controller
 */


//Dependencies
var models = require('models');


exports.listAction = function (req, res) {
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
            res.render('customers/list', results);
        });
};