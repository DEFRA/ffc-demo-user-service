'use strict'
const Umzug = require('umzug')
const db = require('../models')
const config = require('../config')
module.exports = {
  up: (queryInterface, Sequelize) => {
    console.log(config.production)
    const umzug = new Umzug({
      storage: 'sequelize',
      storageOptions: {
        sequelize: db.sequelize
      },
      migrations: {
        path: '.'
      }
    })
    umzug.storage.model.destroy({
      where: {},
      truncate: true
    })
    return queryInterface.createTable('users', {
      userId: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER
      },
      email: {
        type: Sequelize.STRING
      },
      createdAt: {
        allowNull: false,
        type: Sequelize.DATE
      },
      updatedAt: {
        allowNull: false,
        type: Sequelize.DATE
      }
    })
  },
  down: (queryInterface, Sequelize) => {
    return queryInterface.dropTable('users')
  }
}
