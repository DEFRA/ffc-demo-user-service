const dbService = require('../services/database-service')
const DbVersion = require('../dbversion')
const dbVersion = new DbVersion()

module.exports = {
  method: 'GET',
  path: '/healthy',
  options: {
    handler: async (request, h) => {
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
      if (failures.length === 0) {
        return h.response('ok').code(200)
      } else {
        console.log(failures)
        return h.response('not ok').code(500)
      }
    }
  }
}
