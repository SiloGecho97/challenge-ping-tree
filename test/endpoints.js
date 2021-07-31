process.env.NODE_ENV = 'test'

var test = require('ava')
var servertest = require('servertest')
const { getTargets } = require('../lib/controllers/target.controller')
var server = require('../lib/server')
const Stream = require('stream')
const Targets = require('../lib/models')
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



test.serial.cb('should get values by id', function (t) {
  var post_url = '/api/targets'
  var post_opts = { method: 'POST', encoding: 'json' }
  var get_url = '/api/target'
  var get_opts = { method: 'GET', encoding: 'json' }
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

  servertest(server(), post_url, post_opts, onResponse)
    .end(JSON.stringify(target))

  function onResponse(err, res) {
    // t.ifError(err, 'no error')
    t.is(res.statusCode, 200, 'correct statusCode')
    servertest(server(), `${get_url}/${res.body.data.id}`, get_opts, (err, resp) => {
      t.is(JSON.stringify(resp.body.data), JSON.stringify(resp.body.data), 'Correct Data')
      t.end()
    })
  }
})

/**
 * Test Get by Id and Post
 */
test.serial.cb('should post values', function (t) {
  var url = '/api/targets'
  var opts = { method: 'POST', encoding: 'json' }
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
  t.plan(1)
  servertest(server(), url, opts, onResponse)
    .end(JSON.stringify(target))

  function onResponse(err, res) {
    // t.ifError(err, 'no error')
    t.is(res.statusCode, 200, 'correct statusCode')
    t.end()
    const Target = new Targets()
    Target.getTargetCallback(res.body.data.id, (data) => {
      // t.is(JSON.stringify(res.body.data), JSON.stringify(data), 'Correct Data')

    })
  }
})

/**
 * Test Get by Id and Post
 */
test.serial.cb('Route decision', function (t) {
  var url = '/route'
  var opts = { method: 'POST', encoding: 'json' }
  const postData = {
    geoState: "ny",
    publisher: "abc",
    timestamp: "2018-07-19T23:28:59.513Z"
  }

  t.plan(1)
  servertest(server(), url, opts, onResponse)
    .end(JSON.stringify(postData))

  function onResponse(err, res) {
    // t.ifError(err, 'no error')
    t.is(res.statusCode, 200, 'correct statusCode')
    t.is(err, 200, 'correct statusCode')

    t.end()


  }
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
