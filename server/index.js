const hapi = require('@hapi/hapi')
const config = require('./config')
const dbVersion = require('./dbversion')

async function createServer () {
  // Create the hapi server
  const server = hapi.server({
    port: config.port,
    routes: {
      validate: {
        options: {
          abortEarly: false
        }
      }
    }
  })

  if (!await dbVersion.versionCorrect()) {
    throw new Error('dbVersion check did not pass')
  }

  // Register the plugins
  await server.register(require('./plugins/router'))
  await server.register(require('./plugins/error-pages'))

  if (config.isDev) {
    await server.register(require('blipp'))
    await server.register(require('./plugins/logging'))
  }

  return server
}

module.exports = createServer
