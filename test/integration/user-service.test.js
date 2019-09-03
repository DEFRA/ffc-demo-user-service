describe('User service integration test', () => {
  const db = require('../../server/models')
  const userService = require('../../server/services/user-service')

  const testEmail = { email: 'test@example.com' }

  async function truncateUsersTable () {
    return db.users.destroy({
      where: {},
      truncate: true
    })
  }

  // delete records before each test
  beforeEach(async () => {
    await truncateUsersTable()
  })

  test('create should create new user if one does not exist', async () => {
    const result = await userService.create(testEmail)
    // the response from userService is inconsistent. If a user is created a boolean true is returned
    console.log('result of test is', result)
    expect(result).toBe(true)
  })

  test('create should return existing user if one exists', async () => {
    await userService.create(testEmail)
    const result = await userService.create(testEmail)
    // the response from userService is inconsistent. If a user exists, the raw sequelize result is returned
    expect(result.email).toBe(testEmail.email)
  })
})
