"use strict";

/**
 * Render address fields in various formats
 * @returns {{inline}}
 */

module.exports = function() {

    return {
        inline : function(obj) {
            var inititalparts = obj.address.split(/\n/),
                finalParts = [];

            if (obj.address) {
                inititalparts.forEach(function (part) {
                    part = part.trim();
                    if (part) {
                        finalParts.push(part.trim().trim(',').trim());
                    }
                });
            }
            if (obj.postcode) {
                finalParts.push(obj.postcode);
            }

            return finalParts.join(', ');
        }
    };
}