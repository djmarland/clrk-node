"use strict";

module.exports = function(asset) {
    var assetMap = require('assetmap.json');

    if (process.env.NODE_ENV == 'development') {
        // remove from the cache during development (to catch static asset changes)
        delete require.cache[require.resolve('assetmap.json')];
    }

    if (assetMap[asset]) {
        return '/dist/' + assetMap[asset];
    }
    return '';
};