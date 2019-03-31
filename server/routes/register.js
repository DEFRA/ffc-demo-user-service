const schema = require('../schema/user')

module.exports = {
  method: 'POST',
  path: '/register',
  options: {
    validate: { payload: schema,
      failAction: async (request, h, error) => {
        console.log(`rejected payload ${request.payload}`)
        return h.response().code(400)
      }
    },
    handler: async (request, h) => {
      console.log('new user received')

      return h.response().code(200)
    }
  }
}
