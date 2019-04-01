const db = require('../models')

module.exports = {
  getByEmail: async function (email) {
    try {
      return db.users.findOne({
        where: {
          email: email
        }
      })
    } catch (err) {
      console.log(err)
    }
  },
  create: async function (user) {
    try {
      let userRecord = await db.users.upsert({
        email: user.email
      })

      return userRecord
    } catch (err) {
      console.log(err)
      throw err
    }
  }
}
