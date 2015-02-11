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
            address: {
                type: DataTypes.STRING,
                field: 'address'
            },
            postcode: {
                type: DataTypes.STRING,
                field: 'postcode'
            }
        },
        {
            classMethods: {
                associate: function (models) {
                    Customer.hasMany(models.job, { foreignKey: 'customerId' });
                }
            },
            getterMethods: {
                key : function() {
                    return utils.key.fromId(this.id, KEY_PREFIX);
                },
                url : function() {
                    return '/customers/' + this.key;
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
                where: ["id = ?", id],
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
                order: 'id ASC'
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