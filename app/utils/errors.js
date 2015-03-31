"use strict";

/**
 * Various Error types to throw
 */

module.exports = function() {
    return {
        invalidPostcode : function() {
            this.type = "invalidPostcode";
            this.message = "Not a valid UK postcode in the format EX12 3PL";
            this.msgPublic = this.message;
        },
        invalidPhone : function() {
            this.type = "invalidPhone";
            this.message = "Not a valid UK phone number in the format 01234567890";
            this.msgPublic = this.message;
        },
        noChange : function() {
            this.type = "nochange";
            this.message = "No changes were made";
            this.msgPublic = this.message;
            this.msgType = 'info';
        }
    };
}