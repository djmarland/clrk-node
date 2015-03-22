"use strict";

module.exports = function(asset) {
    var assetMap = require('assetmap.json');
    if (assetMap[asset]) {
        return '/dist/' + assetMap[asset];
    }
    return '';
};