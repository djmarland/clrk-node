"use strict";
/**
 * Types Controller
 */


//Dependencies
var models  = require('models'),
    utils   = require('utils');

exports.listAction = function (req, res, next) {
    var perPage = 200,
        data = {
            action : '/job-types',
            jobTypes: null,
            pagination : utils.pagination.setup(
                perPage,
                req
            )
        },
        render = function() {
            models.type.getList(
                data.pagination.perPage,
                data.pagination.currentPage
            ).then(function (result) {
                    var err;
                    data.jobTypes = result.rows;
                    data.deletable = result.count > 1;
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
                        res.render('types/list', data);
                    }
                }).catch(next);
        },
        err;

    if (!req.user.permissions.canEditSettings) {
        err = new Error;
        err.message = 'You do not have permission to do this';
        err.status = 403;
        return next(err);
    }


    if (req.method === 'POST') {
        data.form = req.body;

        // create the type
       models.type.newTitle(data.form.title)
            .then(function(result) {
               res.locals.messages.push({
                   message : 'Saved new job type',
                   type : "success"
               });
               // it was good. clear the form
               data.form = {};
               render();
            })
            .catch(function(err) {
                utils.crud.setFormValidationErrors(data.form, res, err);
                render();
            });

    } else {
        render();
    }
};

exports.showAndEditAction = function (req, res, next) {
    var data = {
            jobType : req.jobType,
            form : req.jobType
        },
        render = function() {
            // get jobs under this type
            return models.job.findLatestByType(data.jobType)
                .then(function(result) {
                    data.latestJobs = result.rows;
                    data.jobsCount = result.count;
                })
                .catch(function(err) {
                    req.flash('msg',{
                        message : 'Failed to fetch jobs for type.',
                        type : "error",
                        debug : err.message
                    });
                }).finally(function() {
                    if (req.format == 'json') {
                        res.json(data);
                    } else {
                        res.render('types/show', data);
                    }
                });



        },
        err;

    if (!req.user.permissions.canEditSettings) {
        err = new Error;
        err.message = 'You do not have permission to do this';
        err.status = 403;
        return next(err);
    }


    if (req.method === 'POST') {
        data.form = req.body;
        data.jobType.update(data.form)
            .then(function(result) {
                res.locals.messages.push({
                    message : 'Saved successfully',
                    type : "success"
                });
            })
            .catch(function (err) {
                utils.crud.setFormValidationErrors(data.form, res, err);
            })
            .finally(function() {
                render();
            });
    } else {
        render();
    }


};


exports.deleteAction = function (req, res, next) {
    var data = {
            jobType : req.jobType,
            form : req.jobType,
            action : req.jobType.url + '/delete'
        },
        render = function() {
            res.render('types/delete', data);
        },
        fetchOthers = function() {
            return models.type.getList(
                999, // @todo - decide a maximum and enforce it (no need for pagination)
                1
            ).then(function (result) {
                    var err;

                    if (result.count <= 1) {
                        err = new Error;
                        err.message = 'You cannot delete the last job type. There must be at least one';
                        err.status = 403;
                        return next(err);
                    }

                    data.jobTypes = [];
                    result.rows.forEach(function(jobType) {
                        // filter out the current job
                        if (jobType.id != data.jobType.id) {
                            data.jobTypes.push(jobType);
                        }
                    });
                    return checkForSubmit();

                }).catch(next);
        },
        checkForSubmit = function() {
            var invalid = true; // default state, until we've checked it
            if (req.method === 'POST') {
                data.form = req.body;
                // if the ID in the form was not a real ID (or is the current),
                // then we have a problem. kill it
                // run through the rest to check it's there
                data.jobTypes.forEach(function(type) {
                   if (type.id == data.form.typeId) {
                       invalid = false; // it exists, so it's not invalid
                   }
                });

                if (invalid) {
                    res.locals.messages.push({
                        message : 'A valid replacement ID was not chosen',
                        type : "error"
                    });
                    return render();
                }
                return beginDelete(data.form.typeId);
            } else {
                return render();
            }
        },
        beginDelete = function(replacementId) {
            // update all jobs to the replacement
            return models.job.updateTypes(data.jobType.id, replacementId)
                .then(function (result) {
                    // updated ok. now to delete the real thing.
                    completeDelete();
                }).catch(next);
        },
        completeDelete = function() {
            return data.jobType.destroy()
                .then(function (result) {
                    req.flash('msg',{
                        message : 'Job type was deleted and jobs were moved to the new type',
                        type : "success"
                    });
                    // redirect to customer page
                    return res.redirect('/job-types');
                }).catch(next);
        },
        err;


    if (!req.user.permissions.canEditSettings) {
        err = new Error;
        err.message = 'You do not have permission to do this';
        err.status = 403;
        return next(err);
    }

    return fetchOthers();

};