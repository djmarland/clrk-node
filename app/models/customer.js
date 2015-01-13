"use strict";

module.exports = function(sequelize, DataTypes) {
    var Customer = sequelize.define("customer", {
        name: {
            type: DataTypes.STRING,
            field: 'name'
        }
    }, {
        freezeTableName: true, // Model tableName will be the same as the model name
        classMethods: {
            associate: function(models) {

            }
        }
    });


    Customer.goFind = function() {

    };

    return Customer;
};