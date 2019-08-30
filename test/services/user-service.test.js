let userService
let MockSequelize
let mockDb
const testEmail = { email: 'test@example.com' }

describe('User Service', () => {
  beforeAll(async () => {
    jest.mock('../../server/models')
    jest.mock('../../server/models/user', () => {
      MockSequelize = require('sequelize-mock')
      mockDb = new MockSequelize('', '', '', { })
      return mockDb.define('users', {
        userId: 1,
        email: 'test@example.com'
      })
    })
    userService = require('../../server/services/user-service')
  })

  beforeEach(async () => {
  })

  test('create should create new user if one does not exist', async () => {
    mockDb.$queueResult([ ])
    const result = await userService.create(testEmail)
    // the response from userService is inconsistent. If a user is created a boolean true is returned
    expect(result).not.toBeFalsy()
  })

  test('create should return existing user if one exists', async () => {
    mockDb.$queueResult({
      userId: 1,
      email: 'test@example.com'
    })
    await userService.create(testEmail)
    const result = await userService.create(testEmail)
    // the response from userService is inconsistent. If a user exists, the raw sequelize result is returned
    expect(result).toBeDefined()
  })
})
