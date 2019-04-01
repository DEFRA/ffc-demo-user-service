'use strict'
module.exports = (sequelize, DataTypes) => {
  const User = sequelize.define('users', {
    userId: { type: DataTypes.INTEGER, primaryKey: true },
    email: DataTypes.STRING
  }, {
    freezeTableName: true,
    tableName: 'users'
  })
  User.associate = function (models) {
    // associations can be defined here
  }
  return User
}
