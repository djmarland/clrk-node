"use strict";

/**
 * Dependencies
 */

var bcrypt = require('bcrypt-nodejs'),
    utils = require('utils'),

    KEY_PREFIX = 'U';

module.exports = function(sequelize, DataTypes) {
    var User = sequelize.define(
        "user",
        {
            id: {
                type: DataTypes.INTEGER,
                autoIncrement: true,
                primaryKey: true
            },
            name: {
                type: DataTypes.STRING,
                field: "name",
                allowNull: false,
                validate: {
                    notEmpty: {
                        msg: 'User must have a name'
                    }
                }
            },
            email: {
                type: DataTypes.STRING,
                field: "email",
                validate: {
                    notEmpty: {
                        msg: 'User must have an e-mail address'
                    },
                    isEmail : true,
                    isUnique: function(value, next) {

                        User.findByEmail(value)
                            .done(function(error, user) {

                                if (error)
                                // Some unexpected error occured with the find method.
                                    return next(error);

                                if (user)
                                // We found a user with this email address.
                                // Pass the error to the next method.
                                    return next('E-mail address is already assigned to another user');

                                // If we got this far, the email address hasn't been used yet.
                                // Call next with no arguments when validation is successful.
                                next();

                            });

                    }
                }
            },
            password: {
                type: DataTypes.STRING,
                field: "password"
            },
            isAdmin: {
                type: DataTypes.BOOLEAN,
                field: "isAdmin",
                allowNull: false,
                defaultValue : false
            },
            passwordExpired : {
                type: DataTypes.DATE
            }
        },
        {
            classMethods: {
            },
            instanceMethods: {
                toJSON: function () {
                    var values = this.values;

                    // don't show sensitive data in JSON
                    delete values.password;
                    delete values.passwordExpired;

                    if (this.client) {
                        values.client = this.client.toJSON();
                    }
                    return values;
                },
                onSave : function() {
                    if (this.changed('password')) {
                        this.setPassword(this.password);
                    }
                },
                setPassword: function(password, done) {
                    var hash = bcrypt.hashSync(password);
                    this.password = hash;
                },
                verifyPassword : function(passwordToCheck) {
                    return bcrypt.compareSync(passwordToCheck, this.password);
                }
            },
            getterMethods: {
                key : function() {
                    return utils.key.fromId(this.id, KEY_PREFIX);
                },
                url : function() {
                    return '/users/' + this.key;
                }
            },
            hooks: {
                beforeCreate: function (user, options, fn) {
                    user.onSave();
                    fn(null, user);
                },
                beforeUpdate: function (user, options, fn) {
                    user.onSave();
                    fn(null, user);
                },
            }
        }
    );


    User.findByKey = function(key) {
        var id = utils.key.toId(key);
        // keys haven't been converted yet
        return User.findById(id);
    };

    User.findById = function(id) {
        return new sequelize.Promise(function(resolve, reject) {
            User.find({
                where: {
                    id: id
                },
                limit: 1
            })
                .then(function(result) {
                    resolve(result);
                }).catch(function(e) {
                    reject(e);
                });
        });
    };

    User.getAll = function(perPage, page) {
        var perPage = perPage || 10;
        page    = page || 1;
        return new sequelize.Promise(function(resolve, reject) {
            User.findAndCountAll({
                offset  : utils.pagination.offset(perPage, page),
                limit   : perPage,
                order: '"name" ASC'
            })
                .then(function(result) {
                    resolve(result);
                }).catch(function(e) {
                    reject(e);
                });
        });
    };

    User.findByEmail = function(email) {
        return new sequelize.Promise(function(resolve, reject) {
            User.findOne({
                where: {
                    email : email
                }
            })
                .then(function(result) {
                    resolve(result);
                }).catch(function(e) {
                    reject(Error("Failed to get user " + e.message));
                });
        });
    };

    User.new = function(data) {
        return new sequelize.Promise(function(resolve, reject) {
            User.create(data)
                .then(function(user) {
                    resolve(user);
                }).catch(function(e) {
                    reject(e)
                });
        });
    };

    return User;
};