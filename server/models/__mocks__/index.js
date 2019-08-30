const db = {}

const Sequelize = require('sequelize')
jest.mock('sequelize', () => {
  const mockSequelize = require('sequelize-mock')
  return mockSequelize
})
let sequelize = new Sequelize()
const user = require('../user')

db.sequelize = sequelize
db.Sequelize = Sequelize
db[user.name] = user
module.exports = db
