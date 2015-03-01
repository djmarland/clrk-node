"use strict";

module.exports = {
    up: function(migration, DataTypes, done) {
        migration.addColumn(
            'customers',
            'editedById',
            {
                type: DataTypes.INTEGER
            }
        );

        done();
    },

    down: function(migration, DataTypes, done) {
        migration.removeColumn('customers', 'editedById');
        done();
    }
};
