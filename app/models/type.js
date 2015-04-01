"use strict";

/**
 * Job types
 */

var utils = require('utils');


module.exports = function(sequelize, DataTypes) {
    var Type = sequelize.define(
        "type",
        {
            id: {
                type: DataTypes.INTEGER,
                autoIncrement: true,
                primaryKey: true
            },
            title: {
                type: DataTypes.STRING,
                field: "title"
            }
        },
        {
            classMethods: {
                associate: function (models) {
                    Type.hasMany(models.job, { foreignKey: "typeId" });
                }
            },
            getterMethods: {
            }
        }
    );

    Type.getList = function() {
        return new sequelize.Promise(function(resolve, reject) {
            Type.findAll({
                order : "title ASC"
            })
                .then(function(result) {
                    resolve(result);
                }).catch(function(e) {
                    reject(Error("It died " + e.message));
                });
        });
    };

    return Type;
};