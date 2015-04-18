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
                field: "title",
                validate: {
                    notEmpty: {
                        msg: 'Job type must have title'
                    }
                }
            }
        },
        {
            classMethods: {
                associate: function (models) {
                    Type.hasMany(models.job, { foreignKey: "typeId" });
                }
            },
            getterMethods: {
                url : function() {
                    return '/job-types/' + this.id;
                }
            }
        }
    );

    Type.findById = function(id) {
        return new sequelize.Promise(function(resolve, reject) {
            var models = require('models'),
                where = {
                    id: id
                };

            Type.findOne({
                where: where,
                limit: 1
            })
                .then(function(result) {
                    resolve(result);
                }).catch(function(e) {
                    reject(e);
                });
        });
    };

    Type.getList = function(perPage, page) {
        var perPage = perPage || 10;
        page    = page || 1;
        return new sequelize.Promise(function(resolve, reject) {
            Type.findAndCountAll({
                offset  : utils.pagination.offset(perPage, page),
                limit   : perPage,
                order : "title ASC"
            })
                .then(function(result) {
                    resolve(result);
                }).catch(function(e) {
                    reject(Error("It died " + e.message));
                });
        });
    };

    Type.newTitle = function(title) {
        return new sequelize.Promise(function(resolve, reject) {
            Type.create({
                title : title
            })
                .then(function(job) {
                    resolve(job);
                }).catch(function(e) {
                    reject(e)
                });
        });
    };

    return Type;
};