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

    return Type;
};