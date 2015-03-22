"use strict";

module.exports = {
    up: function(migration, DataTypes, done) {
        // add altering commands here, calling 'done' when finished
        migration.createTable(
            'users',
            {
                id: {
                    type: DataTypes.INTEGER,
                    primaryKey: true,
                    autoIncrement: true
                },
                createdAt: {
                    type: DataTypes.DATE
                },
                updatedAt: {
                    type: DataTypes.DATE
                },
                name: {
                    type: DataTypes.STRING,
                    allowNull: false
                },
                isAdmin: {
                    type: DataTypes.BOOLEAN,
                    allowNull: false,
                    defaultValue: false
                },
                email: DataTypes.STRING,
                passwordHash: DataTypes.STRING,
                passwordExpiry: DataTypes.DATE
            }
        );
        done();
    },

    down: function(migration, DataTypes, done) {
        // add reverting commands here, calling 'done' when finished
        migration.dropTable('users');
        done();
    }
};
