"use strict";

module.exports = {
    up: function(migration, DataTypes, done) {
        migration.addColumn(
            'settings',
            'theme',
            {
                type: DataTypes.STRING,
                allowNull : false,
                defaultValue : 'dark'
            }
        );

        migration.addColumn(
            'users',
            'theme',
            {
                type: DataTypes.STRING,
                allowNull : true,
                defaultValue : null
            }
        );

        done();
    },

    down: function(migration, DataTypes, done) {
        migration.removeColumn('settings', 'theme');
        migration.removeColumn('users', 'theme');
        done();
    }
};
