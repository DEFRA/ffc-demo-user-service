const Lab = require('lab')
const Code = require('code')
const lab = exports.lab = Lab.script()
const sinon = require('sinon')
const proxyquire = require('proxyquire').noCallThru()

lab.experiment('API test', () => {
  let sandbox
  let service

  const userRepositoryMock = require('./repository/user-repository.mock')

  // Create server before each test
  lab.before(async () => {
    sandbox = sinon.createSandbox()
    service = proxyquire('../server/services/user-service', {
      '../repository/user-repository': userRepositoryMock
    })
  })

  lab.afterEach(async () => {
    sandbox.restore()
  })

  lab.test('user service creates', async () => {
    const response = await service.create({ email: 'test2@email.com' })
    Code.expect(response).to.equal(true)
  })
})
