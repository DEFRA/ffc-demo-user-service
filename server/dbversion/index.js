const fs = require('fs')
const path = require('path')
const Umzug = require('umzug')
const db = require('../models')

class DbVersion {
  constructor () {
    this.availableVersions = []
    this.highestVersion = ''
    this.currentDatabaseVersion = ''
    this.umzug = new Umzug({
      storage: 'sequelize',
      storageOptions: {
        sequelize: db.sequelize
      },
      migrations: {
        path: 'server/migrations'
      }
    })
    const migrationPath = path.join(__dirname, '..', 'migrations')

    fs
      .readdirSync(migrationPath)
      .filter(file => {
        return (path.extname(file) === '.js')
      })
      .forEach(file => {
        this.availableVersions.push(file)
      })
    this.availableVersions = this.availableVersions.sort()
    this.highestVersion = this.availableVersions[this.availableVersions.length - 1]
  }

  async refreshCurrentDatabaseVersion () {
    const result = await this.getLatestFromDB()
    if (result.length > 0) {
      this.currentDatabaseVersion = result[0]
    }
    console.log(result)
  }

  async getLatestFromDB () {
    try {
      return await this.umzug.storage.model.findAll({
        limit: 1,
        order: [['name', 'DESC']]
      })
    } catch (err) {
      console.log(err)
    }
  }

  async getPending () {
    const pending = await this.umzug.pending()
    return pending
  }
}

module.exports = new DbVersion()
