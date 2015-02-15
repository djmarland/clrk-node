"use strict";

// Postcode validation helper
// Based on code from http://www.braemoor.co.uk/software/postcodes.shtml

module.exports = function() {

    return {

        isValid : function(input) {
            var result = this.format(input); // result returns false if not valid
            return !(result === false);
        },

        format : function(input) {
            return this.checkPostCode(input);
        },

        checkPostCode : function(toCheck) {

            // Permitted letters depend upon their position in the postcode.
            var alpha1 = "[abcdefghijklmnoprstuwyz]";                       // Character 1
            var alpha2 = "[abcdefghklmnopqrstuvwxy]";                       // Character 2
            var alpha3 = "[abcdefghjkpmnrstuvwxy]";                         // Character 3
            var alpha4 = "[abehmnprvwxy]";                                  // Character 4
            var alpha5 = "[abdefghjlnpqrstuwxyz]";                          // Character 5
            var BFPOa5 = "[abdefghjlnpqrst]";                               // BFPO alpha5
            var BFPOa6 = "[abdefghjlnpqrstuwzyz]";                          // BFPO alpha6

            // Array holds the regular expressions for the valid postcodes
            var pcexp = new Array();

            // BFPO postcodes
            pcexp.push(new RegExp("^(bf1)(\\s*)([0-6]{1}" + BFPOa5 + "{1}" + BFPOa6 + "{1})$", "i"));

            // Expression for postcodes: AN NAA, ANN NAA, AAN NAA, and AANN NAA
            pcexp.push(new RegExp("^(" + alpha1 + "{1}" + alpha2 + "?[0-9]{1,2})(\\s*)([0-9]{1}" + alpha5 + "{2})$", "i"));

            // Expression for postcodes: ANA NAA
            pcexp.push(new RegExp("^(" + alpha1 + "{1}[0-9]{1}" + alpha3 + "{1})(\\s*)([0-9]{1}" + alpha5 + "{2})$", "i"));

            // Expression for postcodes: AANA  NAA
            pcexp.push(new RegExp("^(" + alpha1 + "{1}" + alpha2 + "{1}" + "?[0-9]{1}" + alpha4 + "{1})(\\s*)([0-9]{1}" + alpha5 + "{2})$", "i"));

            // Exception for the special postcode GIR 0AA
            pcexp.push(/^(GIR)(\s*)(0AA)$/i);

            // Standard BFPO numbers
            pcexp.push(/^(bfpo)(\s*)([0-9]{1,4})$/i);

            // c/o BFPO numbers
            pcexp.push(/^(bfpo)(\s*)(c\/o\s*[0-9]{1,3})$/i);

            // Overseas Territories
            pcexp.push(/^([A-Z]{4})(\s*)(1ZZ)$/i);

            // Anguilla
            pcexp.push(/^(ai-2640)$/i);

            // Load up the string to check
            var postCode = toCheck;

            // Assume we're not going to find a valid postcode
            var valid = false;

            // Check the string against the types of post codes
            for (var i = 0; i < pcexp.length; i++) {

                if (pcexp[i].test(postCode)) {

                    // The post code is valid - split the post code into component parts
                    pcexp[i].exec(postCode);

                    // Copy it back into the original string, converting it to uppercase and inserting a space
                    // between the inward and outward codes
                    postCode = RegExp.$1.toUpperCase() + " " + RegExp.$3.toUpperCase();

                    // If it is a BFPO c/o type postcode, tidy up the "c/o" part
                    postCode = postCode.replace(/C\/O\s*/, "c/o ");

                    // If it is the Anguilla overseas territory postcode, we need to treat it specially
                    if (toCheck.toUpperCase() == 'AI-2640') {
                        postCode = 'AI-2640'
                    }
                    ;

                    // Load new postcode back into the form element
                    valid = true;

                    // Remember that we have found that the code is valid and break from loop
                    break;
                }
            }

            // Return with either the reformatted valid postcode or the original invalid postcode
            if (valid) {
                return postCode;
            } else return false;
        }
    }
}