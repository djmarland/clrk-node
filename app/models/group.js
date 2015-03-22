"use strict";

/**
 * User groups, for setting permissions
 */

var utils = require('utils'),

    KEY_PREFIX = 'G';

module.exports = function(sequelize, DataTypes) {
    var Group = sequelize.define(
        "group",
        {
            id: {
                type: DataTypes.INTEGER,
                autoIncrement: true,
                primaryKey: true
            },
            name: {
                type: DataTypes.STRING,
                field: "name"
            },
            description: {
                type: DataTypes.STRING,
                field: "description"
            },
            isAdmin : {
                type: DataTypes.BOOLEAN,
                field: "isAdmin"
            },
            isDefault : {
                type: DataTypes.BOOLEAN,
                field: "isDefault"
            },
            canEditSettings : {
                type: DataTypes.BOOLEAN,
                field: "canEditSettings"
            },
            canSetAdmins : {
                type: DataTypes.BOOLEAN,
                field: "canSetAdmins"
            },
            canEditUsers : {
                type: DataTypes.BOOLEAN,
                field: "canEditUsers"
            }
        },
        {
            classMethods: {
            },
            getterMethods: {
                key: function () {
                    return utils.key.fromId(this.id, KEY_PREFIX);
                },
                url: function () {
                    return '/groups/' + this.key;
                }
            }
        }
    );

    Group.mergePermissions = function(results) {
        var mergedPermissions = {};
        // merge results
        // any permission which is true in any of the results will set the final one to true

        results.forEach(function(group) {
            var values = group.dataValues,
                key;
            for (key in values) {
                // only keys that begin 'can' are real permissions
                if (key.indexOf('can') === 0) {
                    if (!mergedPermissions[key]) {
                        // if it hadn't been set. set it to false
                        mergedPermissions[key] = false;
                    }
                    if (group.isAdmin || mergedPermissions[key]) {
                        // if this group has it true, set to true
                        mergedPermissions[key] = true;
                    }
                }
            }
        });
        // if the permission result is an admin - EVERYTHING is true
        return mergedPermissions;
    };

    Group.findPermissionByUser = function(user) {
        // eventually this wouldn't be called
        // You would instead call Permissions.FindByUser (which is a linking table)

        return new sequelize.Promise(function (resolve, reject) {
            var queries = [
                ['"isDefault" = ?', true]
            ];
            if (user.isAdmin) {
                queries.push(
                    ['"isAdmin" = ?', true]
                );
            }
            Group.findAll({
                where: sequelize.or.apply(this, queries)
            })
                .then(function (result) {
                    resolve(Group.mergePermissions(result));
                }).catch(function (e) {
                    reject(e);
                });

        });

    };

    return Group;
};