const path = require('path')
const Umzug = require('umzug')
const db = require('./models')
const fs = require('fs')

// Sequelize uses umzug as the engine for running migrations, and stored completed migrations in a table
// This module queries that table to see what migrations have been run against the database, and checks
// against what migrations are available to this code. If there is a mismatch the throwAnyErrors method
// will raise an error.
// If sequelize stops using umzug in the future, umzug can be used to run the migrations directly so
// we can have complete control of that part as well. We can also do this if it becomes necessary to
// store things such as the date a migration took place, or was rolled back.

class DbVersion {
  constructor (options) {
    this.availableVersions = []
    this.highestVersion = ''
    this.currentDatabaseVersion = ''
    if (typeof options !== 'object') {
      options = {}
    }
    if (typeof options.umzug !== 'object') {
      options.umzug = new Umzug({
        storage: 'sequelize',
        storageOptions: {
          sequelize: db.sequelize
        },
        migrations: {
          path: path.join(__dirname, 'migrations')
        }
      })
    }
    this.umzug = options.umzug
  }

  async refreshCurrentDatabaseVersion () {
    const result = await this.getLatestFromDB()
    this.currentDatabaseVersion = result.length > 0 ? result[0].name : ''
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

  async refreshAvailableVersions () {
    const migrationPath = path.join(__dirname, 'migrations')

    this.availableVersions = fs
      .readdirSync(migrationPath)
      .filter(file => path.extname(file) === '.js')
      .sort((a, b) => -a.localeCompare(b))
    this.highestVersion = this.availableVersions.length > 0 ? this.availableVersions[0] : ''
  }

  async throwAnyErrors () {
    const numberPending = (await this.umzug.pending()).length
    if (numberPending > 0) {
      throw new Error('Pending Database migrations exist')
    }
    // Check that the current database version exists in known migrations.
    await this.refreshCurrentDatabaseVersion()
    if (this.currentDatabaseVersion === '') {
      throw new Error('No database version could be found')
    }
    await this.refreshAvailableVersions()
    if (!this.availableVersions.includes(this.currentDatabaseVersion)) {
      throw new Error(`Current database version (${this.currentDatabaseVersion}) unknown to this code. Highest version known is (${this.highestVersion})`)
    }
  }

  async clearCompleted () {
    return this.umzug.storage.model.destroy({
      where: {},
      truncate: true
    })
  }
}

module.exports = DbVersion
