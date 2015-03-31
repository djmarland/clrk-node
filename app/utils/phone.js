"use strict";

// Postcode validation helper
// Based on code from http://www.braemoor.co.uk/software/telnumbers.shtml

module.exports = function() {

    return {

        isValid : function(input) {
            var result = this.format(input); // result returns false if not valid
            return !(result === false);
        },

        format : function(input) {

            // convert UK country code automatically
            input = input.replace('+440','0');
            input = input.replace('+44','0');

            return this.checkPhone(input);
        },

        checkPhone : function(telephoneNumber) {

            // Convert into a string and check that we were provided with something
            var telnum = telephoneNumber + " ";
            if (telnum.length == 1)  {
                return false
            }

            // Don't allow country codes to be included (assumes a leading "+")
            var exp = /^(\+)[\s]*(.*)$/;
            if (exp.test(telnum) == true) {
                return false;
            }

            // Remove spaces from the telephone number to help validation
            while (telnum.indexOf(" ")!= -1)  {
                telnum = telnum.slice (0,telnum.indexOf(" ")) + telnum.slice (telnum.indexOf(" ")+1)
            }

            // Remove hyphens from the telephone number to help validation
            while (telnum.indexOf("-")!= -1)  {
                telnum = telnum.slice (0,telnum.indexOf("-")) + telnum.slice (telnum.indexOf("-")+1)
            }

            // Now check that all the characters are digits
            exp = /^[0-9]{10,11}$/;
            if (exp.test(telnum) != true) {
                return false;
            }

            // Now check that the first digit is 0
            exp = /^0[0-9]{9,10}$/;
            if (exp.test(telnum) != true) {
                return false;
            }

            // Disallow numbers allocated for dramas.

            // Array holds the regular expressions for the drama telephone numbers
            var tnexp = [];
            tnexp.push (/^(0113|0114|0115|0116|0117|0118|0121|0131|0141|0151|0161)(4960)[0-9]{3}$/);
            tnexp.push (/^02079460[0-9]{3}$/);
            tnexp.push (/^01914980[0-9]{3}$/);
            tnexp.push (/^02890180[0-9]{3}$/);
            tnexp.push (/^02920180[0-9]{3}$/);
            tnexp.push (/^01632960[0-9]{3}$/);
            tnexp.push (/^07700900[0-9]{3}$/);
            tnexp.push (/^08081570[0-9]{3}$/);
            tnexp.push (/^09098790[0-9]{3}$/);
            tnexp.push (/^03069990[0-9]{3}$/);

            for (var i=0; i<tnexp.length; i++) {
                if ( tnexp[i].test(telnum) ) {
                    return false;
                }
            }

            // Finally check that the telephone number is appropriate.
       //     exp = (/^(01|02|03|05|070|071|072|073|074|075|07624|077|078|079)[0-9]+$/);
         //   if (exp.test(telnum) != true) {
          //      return false;
          //  }

            // Telephone number seems to be valid - return the stripped telehone number
            return telnum;
        }
    };

};