"use strict";

/**
 * Ensure the whole application considers the same 'Now'
 * @returns {{now: Date}}
 */

module.exports = function() {
    var appTime = new Date();

    return {
        now : appTime
    };
}