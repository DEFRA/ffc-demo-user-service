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

  async versionCorrect () {
    const numberPending = await this.getPending().length
    if (numberPending > 0) {
      throw new Error('Pending Database migrations exist')
    }
    // Check that the current database version exists in known migrations.
    await this.refreshCurrentDatabaseVersion()
    if (this.currentDatabaseVersion === '') {
      throw new Error('No database version could be found')
    }
    if (this.availableVersions.findIndex(x => x === this.currentDatabaseVersion.name) < 0) {
      throw new Error('Current database version unknown to this code')
    }
    return true
  }
}

module.exports = new DbVersion()
