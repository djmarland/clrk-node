"use strict";

var utils = require('utils'),
    STATUS_NONE = 0,
    STATUS_INITIALISED = 1,
    STATUS_SUSPENDED = 2,
    STATUS_WORDING = {},

    THEME_DARK  = 'dark',
    THEME_LIGHT = 'light',
    THEME_HC    = 'hc',
    THEME_WORDING = {};


    STATUS_WORDING[STATUS_NONE] = 'Not ready';
    STATUS_WORDING[STATUS_INITIALISED] = 'Application Initialised';
    STATUS_WORDING[STATUS_SUSPENDED] = 'Application Suspended';

    THEME_WORDING[THEME_DARK]   = 'Dark';
    THEME_WORDING[THEME_LIGHT]  = 'Light';
    THEME_WORDING[THEME_HC]     = 'High Contrast';

module.exports = function(sequelize, DataTypes) {
    var Settings = sequelize.define(
        "settings",
        {
            id: {
                type: DataTypes.INTEGER,
                autoIncrement: true,
                primaryKey: true
            },
            applicationName: {
                type: DataTypes.STRING,
                field: "applicationName"
            },
            status : {
                type: DataTypes.INTEGER,
                field: "status"
            },
            planType : {
                type: DataTypes.INTEGER,
                field: "planType"
            },
            planExpiry : {
                type: DataTypes.DATE,
                field: "planExpiry"
            },
            theme : {
                type: DataTypes.STRING,
                field: "theme"
            }
        },
        {
            classMethods: {
            },
            instanceMethods: {
                toJSON: function () {
                    var values = this.values;

                    // don't show sensitive data in JSON
                    delete values.id;
                    delete values.themeOptions;

                    if (this.client) {
                        values.client = this.client.toJSON();
                    }
                    return values;
                }
            },
            getterMethods: {
                statusName : function() {
                    return STATUS_WORDING[this.status];
                },
                themeName : function() {
                    return THEME_WORDING[this.theme];
                },
                themeOptions : function() {
                    return THEME_WORDING;
                }
            }
        }
    );


    Settings.get = function() {
        return new sequelize.Promise(function(resolve, reject) {
            var models = require('models');
            Settings.findOne({

            })
                .then(function(result) {
                    resolve(result);
                }).catch(function(e) {
                    reject(Error("Failed to fetch application settings " + e.message));
                });
        });
    };

    return Settings;
};