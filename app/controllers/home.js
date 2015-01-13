"use strict";
/**
 * Home Controller
 */


//Dependencies
var models = require('models');


exports.indexAction = function (req, res) {
    models.customer.findAndCountAll({
        where: ["id > ?", 0],
        offset: 0,
        limit: 10
    })
    .then(function(result) {
        var total = result.count;
        var customers = result.rows;

        res.render('home/index', {
                "total" : total,
                "customers" : customers
            }
        );

    });

};