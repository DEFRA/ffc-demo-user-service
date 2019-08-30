const db = require('../models')

module.exports = {
  method: 'GET',
  path: '/healthy',
  options: {
    handler: async (request, h) => {
      if (await db._connected()) {
        return h.response('ok').code(200)
      } else {
        return h.response('not ok').code(500)
      }
    }
  }
}
