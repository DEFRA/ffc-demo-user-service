describe('dbVersion integration test', () => {
  const dbVersion = require('../../server/dbversion')
  const dbVersionGetPending = dbVersion.getPending

  async function truncateVersionTable () {
    return dbVersion.umzug.storage.model.destroy({
      where: {},
      truncate: true
    })
  }

  beforeEach(async () => {
    await truncateVersionTable()
  })

  afterEach(() => {
    dbVersion.getPending = dbVersionGetPending
  })

  test('dbVersion gets a list of available migrations', () => {
    expect(dbVersion.availableVersions.length).toBeGreaterThan(0)
  })

  test('dbVersion validates version in database', async () => {
    await dbVersion.umzug.storage.model.upsert({ name: dbVersion.highestVersion })
    await dbVersion.refreshCurrentDatabaseVersion()
    expect(dbVersion.currentDatabaseVersion).toBe(dbVersion.highestVersion)
  })

  test('dbVersion reports a list of pending migrations', async () => {
    const pending = await dbVersion.getPending()
    expect(pending.length).toBeGreaterThan(0)
  })

  test('dbVersion reports an issue if there are pending migrations', async () => {
    await expect(dbVersion.throwAnyErrors()).rejects.toThrow('Pending Database migrations exist')
  })

  test('dbVersion reports an issue if there are no database versions stored', async () => {
    dbVersion.getPending = jest.fn(() => { return [] })
    await expect(dbVersion.throwAnyErrors()).rejects.toThrow('No database version could be found')
  })

  test('dbVersion does not report an issue if there is a valid database version', async () => {
    dbVersion.getPending = jest.fn(() => { return [] })
    await dbVersion.umzug.storage.model.upsert({ name: dbVersion.highestVersion })
    await expect(dbVersion.throwAnyErrors()).resolves.not.toThrow()
  })

  test('dbVersion reports an issue if there are is an unknown database version', async () => {
    await dbVersion.umzug.storage.model.upsert({ name: 'zzzzzzzzzzesttest.nofile' })
    await expect(dbVersion.throwAnyErrors()).rejects.toThrow()
  })
})
