"use strict";

// Pagination helper

module.exports = function() {
    return {
        offset: function (perPage, page) {
            return (page - 1) * perPage;
        }
    }
};