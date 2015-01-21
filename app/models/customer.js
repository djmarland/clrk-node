"use strict";

module.exports = function(sequelize, DataTypes) {
    var schema = {
        name: {
            type: DataTypes.STRING,
            field: 'name'
        }
    };
    var options = {
        freezeTableName: true, // Model tableName will be the same as the model name
        classMethods: {
            associate: function(models) {

            }
        }
    };
    var Customer = sequelize.define("customer", schema, options);


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