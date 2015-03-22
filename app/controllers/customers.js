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
            customers: null,
            pagination : utils.pagination.setup(
                perPage,
                req
            )
        };
    models.customer.findLatest(
        data.pagination.perPage,
        data.pagination.currentPage
    ).then(function(result) {
            var err;
            data.customers = result.rows;
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
                res.render('customers/list', data);
            }
        }).catch(next);
};

exports.showAndEditAction = function (req, res, next) {
    var data = {
            customer: req.customer,
            customerForm: req.customer
        },

        render = function() {
            data.customerForm.action = data.customer.url;
            data.customerForm.csrfToken = req.csrfToken();
            data.hasEditRights = true;
            if (req.format == 'json') {
                res.json(data);
            } else {
                res.render('customers/show', data);
            }
        },

        latest = function() {
            return models.job.findLatestByCustomer(data.customer)
                .then(function(result) {
                    data.latestJobs = result.rows;
                    data.jobsCount = result.count;
                    return models.customer.countVersionsByCustomer(data.customer).
                        then(function(result) {
                            data.previousVersionCount = result;
                        });
                })
                .catch(function(err) {
                    req.flash('msg',{
                        message : 'Failed to fetch jobs for customer.',
                        type : "error",
                        debug : err.message
                    });
                }).finally(function() {
                    render();
                });
        };

    if (req.method === 'POST') {
        data.customerForm = req.body;
        data.customerForm.editedById = req.user.id;
        data.customer.update(data.customerForm)
            .then(function(result) {
                data.customer.Editor = req.user;
                res.locals.messages.push({
                    message : 'Saved successfully',
                    type : "success"
                });
            })
            .catch(function (err) {
                utils.crud.setFormValidationErrors(data.customerForm, res, err);
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
        customerForm : {
            action : '/customers/new',
            csrfToken : req.csrfToken()
        }
    });
};

exports.createAction = function (req, res, next) {
    var data = {
        customerForm : req.body
    };
    data.customerForm.editedById = 1;
    models.customer.new(data.customerForm)
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
            data.customerForm.action = '/customers/new';
            data.customerForm.csrfToken = req.csrfToken();
            utils.crud.setFormValidationErrors(data.customerForm, res, err);
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
        perPage = 50,
        data = {
            query : query.q || null,
            customers : null,
            pagination : utils.pagination.setup(
                perPage,
                req
            )
        },
        render = function() {
            if (req.format == 'json') {
                res.json(data);
            } else {
                res.render('customers/search', data);
            }
        };

    if (data.query) {
        data.searchForm = {
            q : data.query
        };

        models.customer.searchAndCount(
            data.query,
            data.pagination.perPage,
            data.pagination.currentPage
        )
            .then(function(result) {
                var err, key;
                data.customers = result.rows;
                data.pagination.finalise(result.count);

                // if it matched the key exactly,
                // immediately redirect to that customer
                if (data.pagination.totalCount == 1 &&
                    data.customers[0].key.toLowerCase() == data.query.toLowerCase()
                ) {
                    return res.redirect(data.customers[0].url);
                }

                if (data.pagination.isOutOfRange()) {
                    err = new Error;
                    err.message = 'No such page number';
                    err.status = 404;
                    return next(err);
                }

                if (data.pagination.totalCount > 0) {
                    // apply the search query to each
                    data.customers.forEach(function(customer) {
                        customer.searchQuery = data.query;
                    })
                }
                render();
            });
    } else {
        render();
    }
};

exports.versionsListAction = function(req, res, next) {
    var perPage = 50,
        data = {
            customer : req.customer,
            versions : null,
            pagination : utils.pagination.setup(
                perPage,
                req
            )
        },
        render = function() {
            if (req.format == 'json') {
                res.json(data);
            } else {
                res.render('customers/versions-list', data);
            }
        };

    models.customer.findVersionsByCustomer(
        req.customer,
        data.pagination.perPage,
        data.pagination.currentPage
    )
        .then(function(result) {
            var err, key;
            data.versions = result.rows;
            data.pagination.finalise(result.count);

            if (data.pagination.isOutOfRange()) {
                err = new Error;
                err.message = 'No such page number';
                err.status = 404;
                return next(err);
            }
            render();
        });
};

exports.versionsShowAction = function(req, res, next) {
    var err,
        data = {
            customer : req.customer,
            version : req.version,
            previousVersion : null,
            nextVersion : null
        },
        render = function() {
            if (req.format == 'json') {
                res.json(data);
            } else {
                res.render('customers/versions-show', data);
            }
        };

        if (data.customer.id != data.version.versionOfId) {
            err = new Error;
            err.message = 'The combination of customer ID and version ID does not exist';
            err.status = 404;
            return next(err);
        }

        models.customer.findPreviousVersion(
            data.version
        )
        .then(function(result) {
            data.previousVersion = result;
            return models.customer.findNextVersion(
                data.version
            ).then(function(result) {
                    data.nextVersion = result;
                    render();
                });
        });

};
