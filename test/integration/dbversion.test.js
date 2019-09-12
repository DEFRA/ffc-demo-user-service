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

  test('dbVersion reports an issue if there are database version inconsistancies', async () => {
    expect.assertions(3)
    try {
      const retval = await dbVersion.versionCorrect()
      if (retval) {
        console.log('Found no errors')
      }
    } catch (error) {
      expect(error.message).toEqual('No database version could be found')
    }

    // Pretend we've got an existing migration in the database
    await dbVersion.umzug.storage.model.upsert({ name: dbVersion.highestVersion })
    try {
      const retval = await dbVersion.versionCorrect()
      if (retval) {
        expect(retval).toEqual(true)
      }
    } catch (error) {
      console.log(error)
    }

    // Pretend we've got an unknown migration in the database
    await dbVersion.umzug.storage.model.upsert({ name: 'zzzzzzzzzzesttest.nofile' })
    try {
      const retval = await dbVersion.versionCorrect()
      if (retval) {
        console.log('Found no errors')
      }
    } catch (error) {
      expect(error.message).toEqual('Current database version unknown to this code')
    }
  })
})
