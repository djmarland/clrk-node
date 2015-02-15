"use strict";

var utils = require('utils');

var KEY_PREFIX = 'C';

module.exports = function(sequelize, DataTypes) {
    var Customer = sequelize.define(
        "customer",
        {
            id: {
                type: DataTypes.INTEGER,
                autoIncrement: true,
                primaryKey: true
            },
            name: {
                type: DataTypes.STRING,
                field: 'name',
                allowNull : false,
                validate: {
                    notEmpty: {
                        msg: 'Customer must have a name'
                    }
                }
            },
            versionOfId: {
                type: DataTypes.INTEGER,
                references : "customers",
                referencesKey : "id",
                field: "versionOfId"
            },
            lastName: {
                type: DataTypes.STRING,
                field: 'lastName'
            },
            address: {
                type: DataTypes.STRING,
                field: 'address'
            },
            postcode: {
                type: DataTypes.STRING,
                field: 'postcode',
                validate: {
                    fn: function(val) {
                        if (val && !utils.postcode.isValid(val)) {
                            throw new Error("Not a valid UK postcode in the format AB12 3CD");
                        }
                    }
                }
            }
        },
        {
            classMethods: {
                associate: function (models) {
                    Customer.hasMany(models.job, { foreignKey: 'customerId' });
                    Customer.hasMany(models.customer, { foreignKey: 'versionOfId' });
                    Customer.belongsTo(models.customer, { foreignKey: "versionOfId" });
                }
            },
            instanceMethods : {
                onSave : function() {
                    this.lastName = (this.name.split(' ').slice(-1).pop()).toLowerCase();

                    // @todo sanitise the address. Remove commas, separate onto new lines. trim spaces
                }

            },
            getterMethods: {
                key : function() {
                    return utils.key.fromId(this.id, KEY_PREFIX);
                },
                url : function() {
                    return '/customers/' + this.key;
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
            },
            hooks: {
                beforeCreate: function(customer, options, fn) {
                    customer.onSave();
                    fn(null, customer);
                },
                beforeUpdate: function(customer, options, fn) {
                    customer.onSave();
                    fn(null, customer);
                },
                afterValidate: function(customer, options, fn) {
                    var postcode;
                    if (customer.postcode) {
                        postcode = utils.postcode.format(customer.postcode);
                        if (postcode) {
                            customer.setDataValue('postcode',postcode);
                        }
                    }
                    fn(null, customer);
                }
            }
        }
    );

    Customer.findByKey = function(key) {
        var id = utils.key.toId(key);
        // keys haven't been converted yet
        return Customer.findById(id);
    };

    Customer.findById = function(id) {
        return new sequelize.Promise(function(resolve, reject) {
            Customer.find({
                where: {
                    id: id,
                    versionOfId: null // don't do this. Use the view instead
                },
                limit: 1
            })
            .then(function(result) {
                resolve(result);
            }).catch(function(e) {
                reject(e);
            });
        });
    };

    Customer.goFind = function() {
        return new sequelize.Promise(function(resolve, reject) {
            Customer.findAndCountAll({
                offset: 0,
                limit: 10,
                order: '"lastName" ASC'
            })
            .then(function(result) {
                resolve(result);
            }).catch(function(e) {
                reject(e);
            });
        });
    };

    Customer.searchAndCount = function(query, perPage, page) {
        var idFromKey = utils.key.toIdSanitised(query);
        perPage = perPage || 10;
        page    = page || 1;
        return new sequelize.Promise(function(resolve, reject) {
            var queries = [
                ['"name" ILIKE ?', '%' + query + '%'],
                ['"address" ILIKE ?', '%' + query + '%'],
                ['"postcode" ILIKE ?', '%' + query + '%']
            ];
            if (idFromKey) {
                queries.push(
                    { id : idFromKey }
                );
            }
            Customer.findAndCountAll({
                where   : sequelize.or.apply(this,queries),
                offset  : utils.pagination.offset(perPage, page),
                limit   : perPage,
                order   : '"lastName" ASC'
            })
            .then(function(result) {
                resolve(result);
            }).catch(function(e) {
                reject(e);
            });
        });
    };

    Customer.new = function(data) {
        return new sequelize.Promise(function(resolve, reject) {
            Customer.create(data)
                .then(function(customer) {
                    resolve(customer);
                }).catch(function(e) {
                    reject(e)
                });
        });
    };

    return Customer;
};