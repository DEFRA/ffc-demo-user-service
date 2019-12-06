const dbService = require('../services/database-service')
const DbVersion = require('../dbversion')
const dbVersion = new DbVersion()

module.exports = {
  checkFailures: async () => {
    const failures = []
    try {
      if (await dbService.isConnected()) {
        await dbVersion.throwAnyErrors()
      } else {
        failures.push('database not connected')
      }
    } catch (error) {
      failures.push(`Error raised during health check :${error.message}`)
    }
    return failures
  }
}
