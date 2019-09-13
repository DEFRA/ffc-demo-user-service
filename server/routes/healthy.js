const dbService = require('../services/database-service')
const dbVersion = require('../dbversion')

module.exports = {
  method: 'GET',
  path: '/healthy',
  options: {
    handler: async (request, h) => {
      let allOk = false
      try {
        if (await dbService.isConnected()) {
          if (await dbVersion.versionCorrect()) {
            allOk = true
          }
        }
      } catch (error) {
        allOk = false
      }
      if (allOk) {
        return h.response('ok').code(200)
      } else {
        return h.response('not ok').code(500)
      }
    }
  }
}
