"use strict";

/**
 * Useful controller functions for CRUD where the action
 * is the same
 */

module.exports = function() {
    return {
        setFormValidationErrors : function(form, res, err) {
            if (err.name === 'SequelizeValidationError') {
                err.errors.forEach(function(e) {
                    if (!form.validationErrors) {
                        form.validationErrors = {};
                    }
                    form.validationErrors[e.path] = e.message;
                    form.validationErrors[e.path + 'Class'] = 'error';
                    res.locals.messages.push({
                        message : e.message,
                        type : "error"
                    });
                });
            } else {
                // general error
                res.locals.messages.push({
                    message : 'Error saving data. Please try again',
                    type : "error",
                    debug : err.message
                });
            }
        }
    };
}