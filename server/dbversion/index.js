const fs = require('fs')
const path = require('path')

const dbVersion = {
  availableVersions: [],
  highestVersion: '',
  currentDatabaseVersion: '',
  refreshCurrentDatabaseVersion: () => {

  }
}

const migrationPath = path.join(__dirname, '..', 'migrations')

fs
  .readdirSync(migrationPath)
  .filter(file => {
    return (path.extname(file) === '.js')
  })
  .forEach(file => {
    dbVersion.availableVersions.push(file)
  })

dbVersion.availableVersions = dbVersion.availableVersions.sort()
dbVersion.highestVersion = dbVersion.availableVersions[dbVersion.availableVersions.length - 1]

module.exports = dbVersion
