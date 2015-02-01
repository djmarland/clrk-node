"use strict";

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
                    Job.belongsTo(models.customer, { foreignKey: "customerId" })
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



    return Job;
};