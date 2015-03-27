"use strict";

var utils = require('utils'),

    KEY_PREFIX = 'J';

module.exports = function(sequelize, DataTypes) {
    var Job = sequelize.define(
        "job",
        {
            id: {
                type: DataTypes.INTEGER,
                autoIncrement: true,
                primaryKey: true
            },
            title: {
                type: DataTypes.STRING,
                field: "title"
            },
            address: {
                type: DataTypes.STRING,
                field: "address"
            },
            postcode: {
                type: DataTypes.STRING,
                field: "postcode"
            },
            customerId : {
                type: DataTypes.INTEGER,
                references : "customers",
                referencesKey : "id",
                field: "customerId"
            }
        },
        {
            classMethods: {
                associate: function (models) {
                    Job.belongsTo(models.customer, { foreignKey: "customerId" });
                }
            },
            getterMethods: {
                key: function () {
                    return utils.key.fromId(this.id, KEY_PREFIX);
                },
                url: function () {
                    var parentKey;
                    if (this.versionOfId) {
                        parentKey = utils.key.fromId(this.versionOfId, KEY_PREFIX);
                        return '/jobs/' + parentKey + '/versions/' + this.key;
                    }
                    return '/jobs/' + this.key;
                },
                inlineAddress : function() {
                    var inititalparts = this.address.split(/\n/),
                        finalParts = [];

                    if (this.address) {
                        inititalparts.forEach(function (part) {
                            part = part.trim();
                            if (part) {
                                finalParts.push(part.trim().trim(',').trim());
                            }
                        });
                    }
                    if (this.postcode) {
                        finalParts.push(this.postcode);
                    }

                    return finalParts.join(', ');
                }
            }
        }
    );

    Job.goFind = function() {
        return new sequelize.Promise(function(resolve, reject) {
            var models = require('models');
            Job.findAndCountAll({
                where: ["job.id > ?", 0],
                offset: 0,
                limit: 10,
                include: [ models.customer ]
            })
            .then(function(result) {
                resolve(result);
            }).catch(function(e) {
                reject(Error("It died " + e.message));
            });
        });
    };

    Job.findLatestByCustomer = function(customer) {
        return new sequelize.Promise(function(resolve, reject) {
            Job.findAndCountAll({
                where: ["\"customerId\" = ?", customer.id],
                offset: 0,
                limit: 10,
                order: '\"updatedAt\" DESC'
            })
            .then(function(result) {
                resolve(result);
            }).catch(function(e) {
                reject(Error("It died " + e.message));
            });
        });
    };


    Job.findLatest = function(perPage, page) {
        var perPage = perPage || 10;
        page    = page || 1;
        return new sequelize.Promise(function(resolve, reject) {
            var models = require('models');
            Job.findAndCountAll({
                where : {
           //         versionOfId : null // ideally this should handled with a DB view
                },
                offset  : utils.pagination.offset(perPage, page),
                limit   : perPage,
                order: '"updatedAt" DESC',
                include: [ models.customer ]
            })
                .then(function(result) {
                    resolve(result);
                }).catch(function(e) {
                    reject(e);
                });
        });
    };


    Job.findByKey = function(key) {
        var id = utils.key.toId(key);
        // keys haven't been converted yet
        return Job.findById(id);
    };

    Job.findById = function(id) {
        return new sequelize.Promise(function(resolve, reject) {
            var models = require('models');
            Job.findOne({
                where: {
                    id: id
                },
                limit: 1,
                include: [ models.customer ]
            /*    include: [{
                    model : models.user,
                    as : "Editor"
                }] */
            })
                .then(function(result) {
                    resolve(result);
                }).catch(function(e) {
                    reject(e);
                });
        });
    };


    return Job;
};