"use strict";

/**
 * Useful controller functions for CRUD where the action
 * is the same
 */

module.exports = function() {
    return {
        setFormValidationErrors : function(form, res, err, mapping) {
            if (err.name === 'SequelizeValidationError') {
                err.errors.forEach(function(e) {
                    var path = e.path;
                    if (!form.validationErrors) {
                        form.validationErrors = {};
                    }

                    if (mapping && mapping[path]) {
                        path = mapping[path];
                    }
                    form.validationErrors[path] = e.message;
                    form.validationErrors[path + 'Class'] = 'error';
                    res.locals.messages.push({
                        message : e.message,
                        type : "error"
                    });
                });
            } else {
                // general error
                res.locals.messages.push({
                    message: err.msg || 'Error saving data. Please try again',
                    type: err.msgType || "error",
                    debug: err.message
                });
            }
        }
    };
}