"use strict";

module.exports = {
    up: function(migration, DataTypes, done) {
        // add altering commands here, calling 'done' when finished
        migration.createTable(
            'settings',
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
                applicationName: {
                    type: DataTypes.STRING,
                    allowNull: false,
                    defaultValue : 'Application'
                },
                status : {
                    type: DataTypes.INTEGER,
                    allowNull: false,
                    defaultValue : 0
                },
                planType : {
                    type: DataTypes.INTEGER,
                    allowNull: false,
                    defaultValue : 0
                },
                planExpiry : {
                    type: DataTypes.DATE,
                    allowNull: true
                }
            }
        ).done(function(result) {
            migration.sequelize.query('INSERT INTO "settings" ("createdAt","updatedAt") VALUES (NOW(),NOW())').done(done);
        });
    },

    down: function(migration, DataTypes, done) {
        // add reverting commands here, calling 'done' when finished
        migration.dropTable('settings');
        done();
    }
};
