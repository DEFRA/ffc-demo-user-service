describe('User service integration test', () => {

  const dbVersion = require('../../server/dbversion')

  async function truncateVersionTable () {
    return dbVersion.umzug.storage.model.destroy({
      where: {},
      truncate: true
    })
  }

  beforeEach(async () => {
    await truncateVersionTable()
  })

  test('dbVersion gets a list of available migrations', async () => {
    expect(dbVersion.availableVersions.length).toBeGreaterThan(0)
  })

  test('dbVersion validates version in database', async () => {
    await dbVersion.refreshCurrentDatabaseVersion()
    expect(dbVersion.currentDatabaseVersion).not.toBe(dbVersion.highestVersion)
  })

  test('dbVersion reports a list of pending migrations', async () => {
    const pending = await dbVersion.getPending()
    expect(pending.length).toBeGreaterThan(0)
  })
})
