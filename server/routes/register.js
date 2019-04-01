const schema = require('../schema/user')
const userService = require('../services/user-service')

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
      let user = await userService.create(request.payload)
      return h.response(user).code(200)
    }
  }
}
