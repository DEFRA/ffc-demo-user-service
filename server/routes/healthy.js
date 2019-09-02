const dbService = require('../services/database-service')

module.exports = {
  method: 'GET',
  path: '/healthy',
  options: {
    handler: async (request, h) => {
      if (await dbService.isConnected()) {
        return h.response('ok').code(200)
      } else {
        return h.response('not ok').code(500)
      }
    }
  }
}
