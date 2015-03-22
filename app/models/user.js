"use strict";

/**
 * Dependencies
 */

var bcrypt = require('bcrypt-nodejs'),
    utils = require('utils'),
    models = require('models'),

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
                    isEmail : {
                        args : true,
                        msg : "Not a valid e-mail address"
                    },
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
            isAdmin: { // temporary way of handling admins
                type: DataTypes.BOOLEAN,
                field: "isAdmin"
            },
            theme : {
                type: DataTypes.STRING,
                field: "theme"
            },
            passwordHash: {
                type: DataTypes.STRING,
                field: "passwordHash"
            },
            resetHash: {
                type: DataTypes.STRING,
                field: "resetHash"
            },
            resetPassword: {
                type      : DataTypes.VIRTUAL
            },
            currentPassword : {
                type      : DataTypes.VIRTUAL,
                validate  : {
                    match : function (val) {
                        if (!this.verifyPassword(val)) {
                            throw new Error('Current password is incorrect');
                        }
                    }
                }
            },
            password: {
                type      : DataTypes.VIRTUAL,
                validate  : {
                    len : {
                        args:  [6, Infinity],
                        msg: "For security, your password must be at least 6 characters long"
                    }
                }
            },
            passwordConfirmation: {
                type      : DataTypes.VIRTUAL,
                validate  : {
                    match : function (val) {
                        if (val !== this.password) {
                            throw new Error('The two password fields do not match');
                        }
                    }
                }
            },
            passwordExpiry : {
                type: DataTypes.DATE
            }
        },
        {
            classMethods: {
                associate: function (models) {
                    User.hasMany(models.customer, { foreignKey: "editedById" });
                }
            },
            instanceMethods: {
                toJSON: function () {
                    var values = this.values;

                    // don't show sensitive data in JSON
                    delete values.passwordHash;
                    delete values.passwordExpiry;
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
                    if (this.changed('resetPassword')) {
                        this.setResetPassword(this.resetPassword);
                    }
                },
                setPassword: function(password, done) {
                    var hash = bcrypt.hashSync(password);
                    this.passwordHash = hash;
                    // setting a new password will clear the password expiry
                    this.passwordExpiry = null;
                },
                setResetPassword: function(password, done) {
                    var hash = bcrypt.hashSync(password);
                    this.resetHash = hash;
                },
                verifyPassword : function(passwordToCheck) {
                    return bcrypt.compareSync(passwordToCheck, this.passwordHash);
                },
                verifyResetPassword : function(passwordToCheck) {
                    return bcrypt.compareSync(passwordToCheck, this.resetHash);
                },
                matches : function(user) {
                    return (user.id === this.id);
                }
            },
            getterMethods: {
                key : function() {
                    return utils.key.fromId(this.id, KEY_PREFIX);
                },
                url : function() {
                    return '/users/' + this.key;
                },
                passwordExpired : function() {
                    return(
                        this.passwordExpiry &&
                        this.passwordExpiry <= utils.time.now
                    );
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
                }
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