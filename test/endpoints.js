process.env.NODE_ENV = 'test'

var test = require('ava')
var servertest = require('servertest')

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

test('not found', function (t) {
  var url = '/404'
  servertest(server(), url, { encoding: 'json' }, function (err, res) {
    t.ifError(err, 'no error')

    t.equal(res.statusCode, 404, 'correct statusCode')
    t.equal(res.body.error, 'Resource Not Found', 'error match')
    t.end()
  })
})
