const dbService = require('../services/database-service')
const dbVersion = require('../dbversion')

module.exports = {
  method: 'GET',
  path: '/healthy',
  options: {
    handler: async (request, h) => {
      const failures = []
      try {
        if (await dbService.isConnected()) {
          if (!await dbVersion.versionCorrect()) {
            failures.push('database version incorrect')
          }
        } else {
          failures.push('database not connected')
        }
      } catch (error) {
        failures.push(`Error raised during health check :${error.message}`)
      }
      if (failures.length === 0) {
        return h.response('ok').code(200)
      } else {
        console.log(failures)
        return h.response('not ok').code(500)
      }
    }
  }
}
