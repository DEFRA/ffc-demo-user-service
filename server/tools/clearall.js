const Dbversion = require('../dbversion')
const dbversion = new Dbversion()

dbversion.clearCompleted()

module.exports = dbversion
