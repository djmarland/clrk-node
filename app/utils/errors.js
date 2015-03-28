"use strict";

/**
 * Various Error types to throw
 */

module.exports = function() {
    return {
        invalidPostcode : function() {
            this.type = "invalidPostcode";
            this.message = "Not a valid UK postcode in the format EX12 3PL";
            this.msg = this.message;
        },
        noChange : function() {
            this.type = "nochange";
            this.message = "No changes were made";
            this.msg = this.message;
            this.msgType = 'info';
        }
    };
}