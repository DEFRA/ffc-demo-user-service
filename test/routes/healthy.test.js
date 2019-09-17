describe('Healthy test', () => {
  let createServer
  let server
  let dbService
  let dbversion

  beforeAll(async () => {
    jest.mock('../../server/dbversion')
    dbversion = require('../../server/dbversion')
    createServer = require('../../server')
    jest.mock('../../server/services/database-service')
    dbService = require('../../server/services/database-service')
  })

  beforeEach(async () => {
    dbversion.versionCorrect = jest.fn().mockReturnValue(true)
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
    dbversion.versionCorrect = jest.fn(async () => { throw new Error('Mock error') })

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
