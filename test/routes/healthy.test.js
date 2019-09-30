describe('Healthy test', () => {
  let createServer
  let server
  let dbService
  const Dbversion = require('../../server/dbversion')
  jest.mock('../../server/dbversion')

  beforeAll(async () => {
    createServer = require('../../server')
    jest.mock('../../server/services/database-service')
    dbService = require('../../server/services/database-service')
  })

  beforeEach(async () => {
    jest.spyOn(Dbversion.prototype, 'throwAnyErrors').mockImplementation(() => { })
    server = await createServer()
    await server.initialize()
  })

  afterEach(async () => {
    Dbversion.prototype.throwAnyErrors.mockRestore()
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

  test('GET /healthy route returns 500 when database not connected', async () => {
    const options = {
      method: 'GET',
      url: '/healthy'
    }

    dbService.isConnected = jest.fn(() => false)

    const response = await server.inject(options)
    expect(response.statusCode).toBe(500)
  })

  test('GET /healthy route returns 500 when database version incorrect', async () => {
    const options = {
      method: 'GET',
      url: '/healthy'
    }

    dbService.isConnected = jest.fn(() => true)
    jest.spyOn(Dbversion.prototype, 'throwAnyErrors').mockImplementation(() => { throw new Error('Mock error') })
    // Dbversion.mockImplementationOnce(() => { throw new Error('Mock error') })

    const response = await server.inject(options)
    expect(response.statusCode).toBe(500)
  })

  afterEach(async () => {
    await server.stop()
  })

  afterAll(async () => {
    jest.unmock('../../server/services/database-service')
    jest.unmock('../../server/dbversion')
  })
})
