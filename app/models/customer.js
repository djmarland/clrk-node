"use strict";

module.exports = function(sequelize, DataTypes) {
    var Customer = sequelize.define(
        "customer",
        {
            name: {
                type: DataTypes.STRING,
                field: 'name'
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
            }
        }
    );

    Customer.findById = function(id) {
        return new sequelize.Promise(function(resolve, reject) {
            Customer.find({
                where: ["id = ?", id],
                limit: 1
            })
            .then(function(result) {
                resolve(result);
            }).catch(function(e) {
                reject(Error('It died ' + e.message));
            });
        });
    };

    Customer.goFind = function() {
        return new sequelize.Promise(function(resolve, reject) {
            Customer.findAndCountAll({
                where: ["id > ?", 0],
                offset: 0,
                limit: 10
            })
            .then(function(result) {
                resolve(result);
            }).catch(function(e) {
                reject(Error('It died ' + e.message));
            });
        });
    };

    return Customer;
};