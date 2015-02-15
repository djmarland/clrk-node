"use strict";

module.exports = {
    up: function(migration, DataTypes, done) {
        migration.addColumn(
            'customers',
            'versionOfId',
            {
                type: DataTypes.INTEGER
            }
        );

        migration.addColumn(
            'customers',
            'lastName',
            {
                type: DataTypes.STRING
            }
        );



        done();
    },

    down: function(migration, DataTypes, done) {
        migration.removeColumn('customers', 'versionOf')
        migration.removeColumn('customers', 'lastName')
        done();
    }
};
