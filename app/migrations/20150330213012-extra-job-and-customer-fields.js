"use strict";

module.exports = {
  up: function(migration, DataTypes, done) {
    // add altering commands here, calling 'done' when finished
      migration.addColumn(
          'jobs',
          'status',
          {
              type: DataTypes.INTEGER,
              allowNull : false,
              defaultValue : 0
          }
      );

      migration.addColumn(
          'jobs',
          'completionDate',
          {
              type: DataTypes.DATE,
              allowNull : true
          }
      );

      migration.addColumn(
          'jobs',
          'scheduledStart',
          {
              type: DataTypes.DATE,
              allowNull : true
          }
      );

      migration.addColumn(
          'jobs',
          'scheduledEnd',
          {
              type: DataTypes.DATE,
              allowNull : true
          }
      );

      migration.addColumn(
          'jobs',
          'description',
          {
              type: DataTypes.TEXT,
              allowNull : true
          }
      );

      migration.addColumn(
          'jobs',
          'editedById',
          {
              type: DataTypes.INTEGER,
              allowNull : false
          }
      );

      migration.addColumn(
          'jobs',
          'versionOfId',
          {
              allowNull : true,
              type: DataTypes.INTEGER
          }
      );

      migration.addColumn(
          'jobs',
          'typeId',
          {
              type: DataTypes.INTEGER,
              allowNull : false
          }
      );

      migration.addColumn(
          'customers',
          'phoneNumber',
          {
              type: DataTypes.STRING,
              allowNull : true,
              defaultValue : null
          }
      );

      migration.addColumn(
          'customers',
          'phoneNumber2',
          {
              type: DataTypes.STRING,
              allowNull : true,
              defaultValue : null
          }
      );

    done();
  },

  down: function(migration, DataTypes, done) {
    // add reverting commands here, calling 'done' when finished
      migration.removeColumn('jobs', 'status');
      migration.removeColumn('jobs', 'completionDate');
      migration.removeColumn('jobs', 'scheduledStart');
      migration.removeColumn('jobs', 'scheduledEnd');
      migration.removeColumn('jobs', 'description');
      migration.removeColumn('jobs', 'editedById');
      migration.removeColumn('jobs', 'versionOfId');
      migration.removeColumn('jobs', 'typeId');
      migration.removeColumn('customers', 'phoneNumber');
      migration.removeColumn('customers', 'phoneNumber2');
    done();
  }
};
