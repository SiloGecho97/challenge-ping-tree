process.env.NODE_ENV = 'test'

var test = require('ava')
var servertest = require('servertest')
const { getTargets } = require('../lib/controllers/target.controller')
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

test.serial.cb('Get targets', function (t) {
  var url = '/api/targets'
  getTargets().then(dbData => {
    servertest(server(), url, { encoding: 'json' }, function (err, res) {
      t.falsy(err, 'no error')
      t.is(res.statusCode, 200, 'correct statusCode')
      t.deepEqual(res.body.data, dbData, 'status is ok')
      t.end()
    })
  })
})

test.serial.cb('Post targets', function (t) {
  var url = '/api/targets'
  const target = {
    url: 'http://targets.com',
    value: '0.50',
    maxAcceptsPerDay: '10',
    accept: {
      geoState: {
        $in: ['ca', 'ny']
      },
      hour: {
        $in: ['13', '14', '15']
      }
    }
  }

  const serverStream = servertest(server(), url, { encoding: 'json', method: 'POST' })
  serverStream._write(JSON.stringify(target))
  serverStream.on('end', (_err, data) => {
    // t.falsy(err, 'no error')
    t.is(data.statusCode, 200, 'correct statusCode')
    // t.deepEqual(res.body.data, 'dbData', 'status is ok')
    t.end()
  })
  serverStream.on('data', (_err, data) => {
    console.log(data)
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
