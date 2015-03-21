"use strict";

var utils = require('utils');

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
            initialised : {
                type: DataTypes.BOOLEAN,
                field: "initialised"
            },
            planType : {
                type: DataTypes.INTEGER,
                field: "planType"
            },
            planExpiry : {
                type: DataTypes.DATE,
                field: "planExpiry"
            }
        },
        {
            classMethods: {
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
    }

    return Settings;
};