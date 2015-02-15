"use strict";

module.exports = function() {

    return {
        // inflate the ID to give customer IDs the illusion of authority (big company)
        // not done in the database to avoid need bigint too quickly
        INFLATION: 1020304,

        // remove vowels and 1/0 to reduce likelihood of words being formed
        ALLOWED_CHARACTERS : '23456789BCDFGHJKLMNPQRSTVWXYZ',
        DECIMAL_CHARACTERS : '0123456789',


        toId: function (key) {
            var id = 0,
                power = 0,
                base = this.ALLOWED_CHARACTERS.length,
                keyLen, i;

            // ensure it was in the right case
            key = key.toUpperCase();

            // strip of the first character of the key
            key = key.slice(1);

            // strip out padding zeros
            key = key.replace('0','');

            // convert the key to an id
            key = key.split('').reverse();
            keyLen = key.length;
            for (i = 0; i < keyLen; i++) {
                id = id + (this.ALLOWED_CHARACTERS.indexOf(key[i]) * Math.pow(base,power));
                power++;
            }

            id = (id - this.INFLATION);

            if (id > 0) {
                return id;
            }
            return null; // the key wasn't a real key
        },

        fromId: function (id, prefix) {
            var key = '',
                base = this.ALLOWED_CHARACTERS.length,
                newId, pos;

            // inflate the key
            id = id + this.INFLATION;

            // convert id to key
            while (id > 0) {
                newId = Math.floor(id / base);
                pos = parseInt(id - (newId*base), 10);
                key = (this.ALLOWED_CHARACTERS.charAt(pos)).toString() + key;
                id = newId;
            }

            // pad the front to ensure it's at least 6 characters long
            key = "000000".substring(0, 6 - key.length) + key
            return prefix + key;
        }
    };
};


