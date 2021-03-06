describe('Healthz test', () => {
  let createServer
  let server

  beforeAll(async () => {
    jest.mock('../../server/dbversion')
    const dbversion = require('../../server/dbversion')
    dbversion.throwAnyErrors = jest.fn().mockReturnValue()
    createServer = require('../../server')
  })

  beforeEach(async () => {
    server = await createServer()
    await server.initialize()
  })

  test('GET /healthz route returns 200', async () => {
    const options = {
      method: 'GET',
      url: '/healthz'
    }

    const response = await server.inject(options)
    expect(response.statusCode).toBe(200)
  })

  afterEach(async () => {
    await server.stop()
  })
})
