process.env.NODE_ENV = 'test'

var test = require('ava')
var servertest = require('servertest')
const { getTargets } = require('../lib/controllers/target.controller')
// const redis = require('../lib/redis/index')
var server = require('../lib/server')

test.serial.cb('healthcheck', function (t) {
  var url = '/health'
  servertest(server(), url, { encoding: 'json' }, function (err, res) {
    t.falsy(err, 'no error')

    t.is(res.statusCode, 200, 'correct statusCode')
    t.is(res.body.status, 'OK', 'status is ok')
    t.end()
  })
})

test('async/await support', async t => {
  const value = await Promise.resolve(true);
  var url = '/api/targets'
  t.true(value)
});


test.serial.cb('Get targets', function (t) {
  console.log(t.context.data)
  var url = '/api/targets'
  getTargets().then(db_data => {
    servertest(server(), url, { encoding: 'json' }, function (err, res) {
      t.falsy(err, 'no error')
      t.is(res.statusCode, 200, 'correct statusCode')
      t.deepEqual(res.body.data, db_data, 'status is ok')
      t.end()
    })
  })

})

test.serial.cb('not found', function (t) {
  var url = '/notfound'
  servertest(server(), url, { encoding: 'json' }, function (err, res) {
    t.is(err, null, 'no error')

    t.is(res.statusCode, 404)
    t.is(res.body.error, 'Resource Not Found')
    t.end()
  })
})

