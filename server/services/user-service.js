const userRepository = require('../repository/user-repository')

module.exports = {
  create: async function (user) {
    const existingUser = await userRepository.getByEmail(user.email)
    if (existingUser != null) {
      console.log('existing user, no action required')
      return existingUser
    }
    return userRepository.create(user)
  }
}
