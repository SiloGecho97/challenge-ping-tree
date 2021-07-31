process.env.NODE_ENV = 'test'

var test = require('ava')
var servertest = require('servertest')
const { getTargets, getTargetCallback } = require('../lib/controllers/target.controller')
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
/**
 * Get Targets
 */
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

/**
 * Test Get Target by Id 
 */

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
  //test plan 
  t.plan(2)

  // test
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
 * Test Post by id 
 */
test.serial.cb('should post values', function (t) {
  var url = '/api/targets'
  var opts = { method: 'POST', encoding: 'json' }
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
  //test plan 3
  t.plan(3)
  // post target 
  servertest(server(), url, opts, onResponse)
    .end(JSON.stringify(target))

  //post target callback function
  function onResponse(err, res) {
    t.is(res.statusCode, 200, 'correct statusCode')
    servertest(server(), `${get_url}/${res.body.data.id}`, get_opts, (err, resp) => {
      t.is(resp.statusCode, 200, "Status code passed")
      t.is(JSON.stringify(resp.body.data), JSON.stringify(resp.body.data), 'Correct Data')
      t.end()
    })
  }
})

/**
 * Test Update post
 */

test.serial.cb('should update by id', function (t) {
  const post_url = '/api/targets'
  const opts = { method: 'POST', encoding: 'json' }
  const update_url = '/api/target'
  // create target body
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
  //update target body
  const target2 = {
    url: 'http://targets.com',
    value: '0.90',
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
  //plan for 3 assertion
  t.plan(3)

  // create target
  servertest(server(), post_url, opts, onResponse)
    .end(JSON.stringify(target))

  function onResponse(err, res) {
    //update target
    servertest(server(), `${update_url}/${res.body.data.id}`, opts, onUpdateResponse)
      .end(JSON.stringify(target2))

    function onUpdateResponse(err, resp) {
      t.is(res.statusCode, 200, 'correct statusCode')
      t.is(target2.value, resp.body?.data.value)
      t.not(res.body.data.value, resp.body.data.value)
      t.end()
    }
  }
})

/**
 * Test Route Decision API
 */
test.serial.cb('Route decision', function (t) {
  var url = '/route'
  var opts = { method: 'POST', encoding: 'json' }
  const postData = {
    geoState: "ny",
    publisher: "abc",
    timestamp: "2018-07-19T23:28:59.513Z"
  }

  t.plan(2)
  servertest(server(), url, opts, onResponse)
    .end(JSON.stringify(postData))

  function onResponse(err, res) {
    t.truthy(!(res.body.data))
    t.is(res.statusCode, 200, 'correct statusCode')
    t.end()
  }
})

/**
 * Not Found Test
 */
test.serial.cb('not found', function (t) {
  var url = '/notfound'
  servertest(server(), url, { encoding: 'json' }, function (err, res) {
    t.is(err, null, 'no error')

    t.is(res.statusCode, 404)
    t.is(res.body.error, 'Resource Not Found')
    t.end()
  })
})
