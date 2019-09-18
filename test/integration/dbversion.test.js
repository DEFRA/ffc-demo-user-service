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

  test('dbVersion gets a list of available migrations', () => {
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

  test('dbVersion reports an issue if there are no database versions stored', async () => {
    expect.assertions(1)
    await expect(dbVersion.throwAnyErrors()).rejects.toThrow()
  })

  test('dbVersion does not report an issue if there is a valid database version', async () => {
    expect.assertions(1)
    await dbVersion.umzug.storage.model.upsert({ name: dbVersion.highestVersion })
    await expect(dbVersion.throwAnyErrors()).resolves.not.toThrow()
  })

  test('dbVersion reports an issue if there are is an unknown database version', async () => {
    expect.assertions(1)
    await dbVersion.umzug.storage.model.upsert({ name: 'zzzzzzzzzzesttest.nofile' })
    await expect(dbVersion.throwAnyErrors()).rejects.toThrow()
  })
})
