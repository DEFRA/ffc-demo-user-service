const healthchecks = require('../tools/health-checks')

module.exports = {
  method: 'GET',
  path: '/healthy',
  options: {
    handler: async (request, h) => {
      const failures = await healthchecks.checkFailures()
      if (failures.length === 0) {
        return h.response('ok').code(200)
      } else {
        console.log(failures)
        return h.response('not ok').code(500)
      }
    }
  }
}
