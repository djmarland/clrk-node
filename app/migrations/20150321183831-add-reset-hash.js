"use strict";

module.exports = {
    up: function(migration, DataTypes, done) {
        migration.addColumn(
            'users',
            'resetHash',
            {
                type: DataTypes.STRING
            }
        );

        done();
    },

    down: function(migration, DataTypes, done) {
        migration.removeColumn('users', 'resetHash');
        done();
    }
};
