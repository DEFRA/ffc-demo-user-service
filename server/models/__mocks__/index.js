const db = {}
let _internalconnected = true

const Sequelize = require('sequelize')
jest.mock('sequelize', () => {
  const mockSequelize = require('sequelize-mock')
  return mockSequelize
})
let sequelize = new Sequelize()
const user = require('../user')

db.sequelize = sequelize
db.Sequelize = Sequelize
db._connected = async (override) => {
  if (typeof override === 'boolean')
  {
    _internalconnected = override
  }
  return _internalconnected
}
db[user.name] = user
module.exports = db
