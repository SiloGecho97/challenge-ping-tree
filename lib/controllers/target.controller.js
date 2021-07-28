const sendJson = require('send-data/json')
var http = require('http')
const redis = require('../redis/index')

module.exports = {
  targetHandler,
  addTarget,
  getOneTarget
}

function targetHandler (req, res, query, err) {
  console.log(query, 'get')
  if (!req.method) return
  if (req.method === 'GET') {
    getTarget(req, res, err)
  } else if (req.method === 'POST') {
    let data = ''
    req.on('data', chunk => {
      data += chunk
    })
    req.on('end', () => {
      addTarget(req, res, JSON.parse(data), err)
    })
    // addTarget(req, res, query, err)
  } else if (req.method === 'PUT') {
    editTarget(req, res)
  }

  // res.writeHead(200)
  // res.end('Welcome')
}

function getTarget (req, res, error) {
  redis.getTargets((err, data) => {
    if (err) {
      res.statusCode = 500
      return error()
    }
    const sendData = data.map(item => {
      return JSON.parse(item)
    })
    res.statusCode = 200
    sendJson(req, res, {
      error: http.STATUS_CODES[res.statusCode],
      data: sendData
    })
    res.end()
  })
}

function addTarget (req, res, body, err) {
  console.log('Body', body)
  // res.writeHead(200)

  redis.saveTarget(JSON.stringify(body), (err) => {
    console.log(err)
    res.statusCode = 200

    sendJson(req, res, {
      error: http.STATUS_CODES[res.statusCode],
      message: 'success'
    })
    res.end()
  })
}

function editTarget (req, res) {
  console.log('get')
  res.writeHead(200)
  res.end('Welcome')
}

function getOneTarget (req, res, query) {
  console.log('get', query)
  // redis.getTargetById(query.params.id, (err, data) => {
  //   console.log(err, data)
  // })
  res.writeHead(200)
  res.end(query.id)
}
