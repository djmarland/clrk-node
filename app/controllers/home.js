"use strict";
/**
 * Home Controller
 */


//Dependencies
var models = require('models');


exports.indexAction = function (req, res) {
    models.customer.goFind()
    .then(function(result) {
            console.log('done ok');
        res.render('home/index', {
            "total" : result.count,
            "customers" : result.rows
        });
    })
    .catch(function(e) {
        console.log(e.message);
            res.send('killed');
    });
};