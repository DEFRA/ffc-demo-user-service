const Lab = require('lab')
const Code = require('code')
const db = require('../server/models')
const userService = require('../server/services/user-service')
const lab = exports.lab = Lab.script()

const testEmail = { email: 'test@email.com' }
async function truncateUsersTable () {
  return db.users.destroy({
    where: {},
    truncate: true
  })
}

lab.experiment('User Service', () => {
  // delete records before each test
  lab.beforeEach(async () => {
    await truncateUsersTable()
  })

  lab.test('create should create new user if one does not exist', async () => {
    const result = await userService.create(testEmail)
    // the response from userService is inconsistent. If a user is created a boolean true is returned
    Code.expect(result).to.exist()
  })

  lab.test('create should return existing user if one exists', async () => {
    await userService.create(testEmail)
    const result = await userService.create(testEmail)
    // the response from userService is inconsistent. If a user exists, the raw sequelize result is returned
    Code.expect(result).to.exist()
  })
})
