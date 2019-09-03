describe('Healthy test', () => {
  let createServer
  let server
  let dbService

  beforeAll(async () => {
    createServer = require('../../server')
    jest.mock('../../server/services/database-service')
    dbService = require('../../server/services/database-service')
  })

  beforeEach(async () => {
    server = await createServer()
    await server.initialize()
  })

  test('GET /healthy route returns 200 when database connected', async () => {
    const options = {
      method: 'GET',
      url: '/healthy'
    }

    dbService.isConnected = jest.fn(() => true)

    const response = await server.inject(options)
    expect(response.statusCode).toBe(200)
  })

  test('GET /healthy route returns 500 when not database connected', async () => {
    const options = {
      method: 'GET',
      url: '/healthy'
    }

    dbService.isConnected = jest.fn(() => false)

    const response = await server.inject(options)
    expect(response.statusCode).toBe(500)
  })

  afterEach(async () => {
    await server.stop()
  })

  afterAll(async () => {
    jest.unmock('../../server/services/database-service')
  })
})
