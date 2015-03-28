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
                field: "title",
                allowNull : false,
                validate: {
                    notEmpty: {
                        msg: 'Job must have a title'
                    }
                }
            },
            address: {
                type: DataTypes.STRING,
                field: "address"
            },
            postcode: {
                type: DataTypes.STRING,
                field: "postcode",
                validate: {
                    fn: function(val) {
                        if (val && !utils.postcode.isValid(val)) {
                            throw new utils.errors.invalidPostcode();
                        }
                    }
                }
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
            instanceMethods: {
                onSave : function() {

                    // @todo sanitise the address. Remove commas, separate onto new lines. trim spaces
                    if (!this.changed()) {
                        // nothing changed
                        throw new utils.errors.noChange();
                        throw new function() {
                            this.type = 'nochange';
                        };
                    }

                    if (!this.isNewRecord) {
                       // this.copyToVersion();
                    }
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
                    return utils.address.inline(this);
                }
            },
            hooks: {
                beforeCreate: function(job, options, fn) {
                    job.onSave();
                    fn(null, job);
                },
                beforeUpdate: function(job, options, fn) {
                    job.onSave();
                    fn(null, job);
                },
                afterValidate: function(job, options, fn) {
                    var postcode;
                    if (job.postcode) {
                        postcode = utils.postcode.format(job.postcode);
                        if (postcode) {
                            job.setDataValue('postcode',postcode);
                        }
                    }
                    fn(null, job);
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


    Job.new = function(data) {
        return new sequelize.Promise(function(resolve, reject) {
            Job.create(data)
                .then(function(job) {
                    resolve(job);
                }).catch(function(e) {
                    reject(e)
                });
        });
    };

    return Job;
};