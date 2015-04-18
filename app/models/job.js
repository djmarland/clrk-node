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
            versionOfId: {
                type: DataTypes.INTEGER,
                references : "job",
                referencesKey : "id",
                field: "versionOfId"
            },
            editedById: {
                type: DataTypes.INTEGER,
                references : "users",
                referencesKey : "id",
                field: "editedById"
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
            },
            status : {
                type: DataTypes.INTEGER,
                field: "status"
            },
            typeId : {
                type: DataTypes.INTEGER,
                references : "types",
                referencesKey : "id",
                field: "typeId",
                allowNull : false,
                validate: {
                    notEmpty: {
                        msg: 'A job type must be set'
                    }
                }
            },
            completionDate : {
                type: DataTypes.DATE
            },
            scheduledStart : {
                type: DataTypes.DATE
            },
            scheduledEnd : {
                type: DataTypes.DATE
            },
            description : {
                type: DataTypes.TEXT
            }
        },
        {
            classMethods: {
                associate: function (models) {
                    Job.belongsTo(models.customer, { foreignKey: "customerId" });
                    Job.hasMany(models.job, { foreignKey: "versionOfId" });
                    Job.belongsTo(models.job, { foreignKey: "versionOfId" });
                    Job.belongsTo(models.user, {
                        as : "Editor",
                        foreignKey: "editedById"
                    });
                    Job.belongsTo(models.type, {
                        as : "Type",
                        foreignKey: "typeId"
                    });
                }
            },
            instanceMethods: {
                onSave : function() {

                    // @todo sanitise the address. Remove commas, separate onto new lines. trim spaces
                    if (!this.changed()) {
                        // nothing changed
                        throw new utils.errors.noChange();
                    }

                    if (!this.isNewRecord) {
                        this.copyToVersion();
                    }
                },
                copyToVersion : function() {
                    var self = this,
                        originalId = this.id,
                        attributes = this._previousDataValues,
                        query = 'insert',
                        args;

                    delete attributes.id; // remove the 'id' field so it can be reset
                    attributes.versionOfId = originalId;

                    args = [self, self.Model.getTableName(), attributes, {}];

                    return self.QueryInterface[query].apply(self.QueryInterface, args)
                        .then(function(result) {
                            return result;
                        });
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

    Job.findLatestByType = function(type) {
        return new sequelize.Promise(function(resolve, reject) {
            Job.findAndCountAll({
                where: ["\"typeId\" = ?", type.id],
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
                include: [
                    models.customer,
                    {
                        model : models.user,
                        as : "Editor"
                    },
                    {
                        model : models.type,
                        as : "Type"
                    }
                ]
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

    Job.updateTypes = function(oldId, newId) {
        return new sequelize.Promise(function(resolve, reject) {
            Job.update({
                typeId : newId
            },{
                where: {
                    typeId: oldId
                }
            })
                .then(function(job) {
                    resolve(job);
                }).catch(function(e) {
                    reject(e)
                });
        });
    };

    return Job;
};