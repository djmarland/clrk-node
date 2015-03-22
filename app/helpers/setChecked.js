"use strict";

module.exports = function(compare, value) {
    // ensure empties are all classed as nulls
    value = value || null;
    compare = compare || null;

    // compare the strings;
    if (value == compare) {
        return 'checked'
    }
    return '';
};