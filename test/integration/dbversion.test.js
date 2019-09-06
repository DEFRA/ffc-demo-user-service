describe('User service integration test', () => {

  const db = require('../../server/models')

  async function truncateVersionTable () {
    return db.dbversion.destroy({
      where: {},
      truncate: true
    })
  }

  const dbVersion = require('../../server/dbversion')
  beforeEach(async () => {
    truncateVersionTable()
  })

  test('dbVersion gets a list of available migrations', async () => {
    expect(dbVersion.availableVersions.length).toBeGreaterThan(0)
  })

  test('dbVersion validates version in database', async () => {

  })
})
