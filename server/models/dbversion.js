'use strict'
module.exports = (sequelize, DataTypes) => {
  const DbVersion = sequelize.define('dbversion', {
    versionId: { type: DataTypes.INTEGER, primaryKey: true },
    migrationFile: DataTypes.STRING
  }, {
    freezeTableName: true,
    tableName: 'dbversion'
  })
  DbVersion.associate = function (models) {
    // associations can be defined here
  }
  return DbVersion
}
