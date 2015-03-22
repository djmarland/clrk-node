"use strict";

module.exports = {
    up: function(migration, DataTypes, done) {
        // add altering commands here, calling 'done' when finished
        migration.createTable(
            'groups',
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
                description: {
                    type: DataTypes.STRING,
                    allowNull: true
                },
                isAdmin : {
                    type: DataTypes.BOOLEAN,
                    allowNull: false,
                    defaultValue : false
                },
                isDefault : {
                    type: DataTypes.BOOLEAN,
                    allowNull: false,
                    defaultValue : false
                },
                canEditSettings : {
                    type: DataTypes.BOOLEAN,
                    allowNull: false,
                    defaultValue : false
                },
                canSetAdmins : {
                    type: DataTypes.BOOLEAN,
                    allowNull: false,
                    defaultValue : false
                },
                canEditUsers : {
                    type: DataTypes.BOOLEAN,
                    allowNull: false,
                    defaultValue : false
                }
            }
        ).done(function(result) {
                var now = new Date();
                // create the initial groups (cannot be deleted)
                migration.sequelize.query(
                    'INSERT INTO "groups" ' +
                    '("createdAt", "updatedAt", "name","description", "isAdmin", "isDefault")' +
                    'VALUES ' +
                    '(NOW(),NOW(),\'ADMINS\',\'A group of users that are admins. They have access to everything.\',true,false)').done(done);
                migration.sequelize.query(
                    'INSERT INTO "groups" ' +
                    '("createdAt", "updatedAt", "name","description", "isAdmin", "isDefault")' +
                    'VALUES ' +
                    '(NOW(),NOW(),\'DEFAULT\',\'A group that all users are part of automatically\',false,true)').done(done);
            });
    },

    down: function(migration, DataTypes, done) {
        // add reverting commands here, calling 'done' when finished
        migration.dropTable('groups');
        done();
    }
};
